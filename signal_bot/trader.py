"""Esecuzione degli ordini su MetaTrader 5 (funziona solo su Windows con MT5 aperto)."""
import json
import logging
import os
import time
from datetime import datetime

from .parser import Signal
from .planner import build_legs, decide_entry, lot_for_risk

log = logging.getLogger("trader")

try:
    import MetaTrader5 as mt5
except ImportError:  # permette di importare il modulo (e fare i test) anche fuori da Windows
    mt5 = None


class TradeRefused(Exception):
    pass


class Mt5Trader:
    def __init__(self, cfg: dict):
        if mt5 is None:
            raise RuntimeError("Pacchetto MetaTrader5 non installato (serve Windows): pip install MetaTrader5")
        self.cfg = cfg
        self.t = cfg["trading"]
        self.magic = int(self.t.get("magic", 770011))
        self.dry_run = bool(self.t.get("dry_run", True))
        self.state_file = cfg.get("state_file", "state.json")
        self.state = self._load_state()

    # ------------------------------------------------------------------ setup
    def connect(self) -> str:
        m = self.cfg["mt5"]
        kwargs = {k: m[k] for k in ("path", "login", "password", "server") if m.get(k)}
        if "login" in kwargs:
            kwargs["login"] = int(kwargs["login"])
        if not mt5.initialize(**kwargs):
            raise RuntimeError(f"Connessione a MT5 fallita: {mt5.last_error()}")
        acc = mt5.account_info()
        is_demo = acc.trade_mode == mt5.ACCOUNT_TRADE_MODE_DEMO
        if not is_demo and not self.t.get("allow_live", False):
            mt5.shutdown()
            raise RuntimeError("Il conto NON è demo e allow_live è false: mi fermo per sicurezza.")
        if acc.margin_mode != mt5.ACCOUNT_MARGIN_MODE_RETAIL_HEDGING:
            log.warning("Il conto non è 'hedging': più posizioni sullo stesso simbolo verranno sommate "
                        "e la gestione multi-TP non funzionerà come previsto.")
        return (f"Connesso a MT5: conto {acc.login} ({'DEMO' if is_demo else 'REALE'}), "
                f"saldo {acc.balance:.2f} {acc.currency}, dry_run={self.dry_run}")

    def shutdown(self):
        mt5.shutdown()

    # ------------------------------------------------------------------ state
    def _load_state(self) -> dict:
        if os.path.exists(self.state_file):
            with open(self.state_file, encoding="utf-8") as f:
                return json.load(f)
        return {"signals": {}}

    def _save_state(self):
        with open(self.state_file, "w", encoding="utf-8") as f:
            json.dump(self.state, f, indent=2)

    # ---------------------------------------------------------------- helpers
    def _resolve_symbol(self, symbol: str) -> str:
        mapped = self.t.get("symbol_map", {}).get(symbol, symbol) + self.t.get("symbol_suffix", "")
        allowed = self.t.get("allowed_symbols")
        if allowed and symbol not in allowed and mapped not in allowed:
            raise TradeRefused(f"simbolo {symbol} non tra quelli ammessi")
        if not mt5.symbol_select(mapped, True):
            raise TradeRefused(f"simbolo {mapped} non trovato sul broker (controlla symbol_map/symbol_suffix)")
        return mapped

    @staticmethod
    def _filling(info) -> int:
        if info.filling_mode & 1:
            return mt5.ORDER_FILLING_FOK
        if info.filling_mode & 2:
            return mt5.ORDER_FILLING_IOC
        return mt5.ORDER_FILLING_RETURN

    def _our_positions(self):
        return [p for p in (mt5.positions_get() or []) if p.magic == self.magic]

    def _our_orders(self):
        return [o for o in (mt5.orders_get() or []) if o.magic == self.magic]

    def _today_pnl(self) -> float:
        start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        deals = mt5.history_deals_get(start, datetime.now()) or []
        return sum(d.profit + d.commission + d.swap for d in deals if d.magic == self.magic)

    def _check_limits(self, balance: float):
        max_sig = self.t.get("max_open_signals")
        if max_sig and len(self.state["signals"]) >= max_sig:
            raise TradeRefused(f"già {len(self.state['signals'])} segnali aperti (max {max_sig})")
        max_dd = self.t.get("max_daily_loss_percent")
        if max_dd:
            pnl = self._today_pnl()
            if pnl <= -balance * max_dd / 100:
                raise TradeRefused(f"perdita giornaliera {pnl:.2f} oltre il limite del {max_dd}%")

    # ---------------------------------------------------------------- execute
    def execute(self, sig: Signal, signal_id: str) -> str:
        symbol = self._resolve_symbol(sig.symbol)
        info = mt5.symbol_info(symbol)
        tick = mt5.symbol_info_tick(symbol)
        acc = mt5.account_info()
        self._check_limits(acc.balance)

        decision = decide_entry(sig, tick.bid, tick.ask)
        if decision.kind == "skip":
            raise TradeRefused(decision.reason)
        if decision.kind == "limit" and not self.t.get("pending_on_miss", True):
            raise TradeRefused(decision.reason + " (pending_on_miss disattivato)")

        order_type = mt5.ORDER_TYPE_BUY if sig.is_buy else mt5.ORDER_TYPE_SELL
        if self.t.get("lot_mode", "risk") == "fixed":
            total_lot = float(self.t["fixed_total_lot"])
        else:
            loss = mt5.order_calc_profit(order_type, symbol, 1.0, decision.price, sig.sl)
            if loss is None:
                raise TradeRefused(f"impossibile calcolare il rischio: {mt5.last_error()}")
            total_lot = lot_for_risk(acc.balance, float(self.t["risk_percent"]), abs(loss))

        legs = build_legs(sig, self.t.get("tp_targets", [1, 2, 3, "OPEN"]), total_lot,
                          info.volume_min, info.volume_step, info.volume_max)
        if not legs:
            raise TradeRefused(f"lotto calcolato {total_lot:.3f} inferiore al minimo {info.volume_min}")

        if decision.kind == "market":
            action, otype = mt5.TRADE_ACTION_DEAL, order_type
        else:
            action = mt5.TRADE_ACTION_PENDING
            otype = mt5.ORDER_TYPE_BUY_LIMIT if sig.is_buy else mt5.ORDER_TYPE_SELL_LIMIT

        lines = [f"{sig.direction} {symbol} — {decision.kind.upper()}"
                 + (f" ({decision.reason})" if decision.reason else ""),
                 f"SL {sig.sl} | lotti totali {sum(l[2] for l in legs):.2f}"]
        tickets = {}
        for name, tp, volume in legs:
            if decision.kind == "market":
                t = mt5.symbol_info_tick(symbol)
                price = t.ask if sig.is_buy else t.bid
            else:
                price = decision.price
            req = {
                "action": action,
                "symbol": symbol,
                "volume": volume,
                "type": otype,
                "price": round(price, info.digits),
                "sl": round(sig.sl, info.digits),
                "tp": round(tp, info.digits) if tp else 0.0,
                "deviation": int(self.t.get("max_slippage_points", 30)),
                "magic": self.magic,
                "comment": f"SB{signal_id}-{name}"[:31],
                "type_time": mt5.ORDER_TIME_GTC,
                "type_filling": self._filling(info) if decision.kind == "market" else mt5.ORDER_FILLING_RETURN,
            }
            if self.dry_run:
                lines.append(f"  [DRY RUN] {name}: {volume} lotti, TP {tp or 'aperto'}")
                continue
            res = mt5.order_send(req)
            if res is None or res.retcode not in (mt5.TRADE_RETCODE_DONE, mt5.TRADE_RETCODE_PLACED):
                err = res.comment if res else mt5.last_error()
                lines.append(f"  ❌ {name}: errore {getattr(res, 'retcode', '')} {err}")
                continue
            ticket = res.order
            tickets[name] = ticket
            lines.append(f"  ✅ {name}: #{ticket} {volume} lotti @ {res.price or price}, TP {tp or 'aperto'}")

        if tickets:
            self.state["signals"][signal_id] = {
                "symbol": symbol,
                "first_leg": legs[0][0],
                "tickets": tickets,
                "breakeven_done": False,
                "created": time.time(),
            }
            self._save_state()
        return "\n".join(lines)

    # ---------------------------------------------------------------- monitor
    def monitor(self) -> list:
        """Da chiamare periodicamente: cancella i pending scaduti e sposta lo SL a pareggio."""
        notes = []
        expiry = self.t.get("pending_expiry_minutes", 60)
        pending = {o.ticket: o for o in self._our_orders()}
        now = time.time()
        if expiry:
            # l'orario di creazione lo teniamo noi: time_setup di MT5 è nel fuso del server
            for sid, s in self.state["signals"].items():
                if now - s.get("created", now) < expiry * 60:
                    continue
                for t in s["tickets"].values():
                    if t in pending and self._cancel_order(t):
                        notes.append(f"⌛ Ordine pendente #{t} ({pending[t].comment}) cancellato: scaduto")

        positions = {p.ticket: p for p in self._our_positions()}
        live = set(positions) | {o.ticket for o in self._our_orders()}

        for sid, s in list(self.state["signals"].items()):
            tickets = s["tickets"]
            if not any(t in live for t in tickets.values()):
                del self.state["signals"][sid]
                continue
            if s["breakeven_done"] or not self.t.get("breakeven_after_first_tp", True):
                continue
            first = tickets.get(s["first_leg"])
            if first is None or first in live:
                continue
            deals = mt5.history_deals_get(position=first) or []
            if sum(d.profit for d in deals) <= 0:
                s["breakeven_done"] = True  # il primo leg è uscito in perdita: niente pareggio
                continue
            moved = []
            for name, t in tickets.items():
                p = positions.get(t)
                if p and self._move_sl(p, p.price_open):
                    moved.append(name)
            s["breakeven_done"] = True
            if moved:
                notes.append(f"🔒 Segnale {sid}: {s['first_leg']} preso, SL a pareggio su {', '.join(moved)}")
        self._save_state()
        return notes

    def _cancel_order(self, ticket: int) -> bool:
        if self.dry_run:
            return False
        res = mt5.order_send({"action": mt5.TRADE_ACTION_REMOVE, "order": ticket})
        return bool(res and res.retcode == mt5.TRADE_RETCODE_DONE)

    def _move_sl(self, p, new_sl: float) -> bool:
        if self.dry_run:
            return False
        res = mt5.order_send({
            "action": mt5.TRADE_ACTION_SLTP,
            "position": p.ticket,
            "symbol": p.symbol,
            "sl": new_sl,
            "tp": p.tp,
            "magic": self.magic,
        })
        ok = bool(res and res.retcode == mt5.TRADE_RETCODE_DONE)
        if not ok:
            log.warning("Spostamento SL fallito su #%s: %s", p.ticket, res.comment if res else mt5.last_error())
        return ok
