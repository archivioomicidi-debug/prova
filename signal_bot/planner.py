"""Logica pura (senza MetaTrader): come entrare, quanti lotti, come dividerli sui TP."""
import math
from dataclasses import dataclass
from typing import Optional

from .parser import Signal


@dataclass
class EntryDecision:
    kind: str                 # "market", "limit" o "skip"
    price: Optional[float] = None
    reason: str = ""


def decide_entry(sig: Signal, bid: float, ask: float) -> EntryDecision:
    """Prezzo nel range (o migliore, ma prima dello stop) -> a mercato.
    Prezzo già andato verso i TP ma prima del TP1 -> ordine limite sul bordo del range.
    Stop già toccato o TP1 già raggiunto -> salta."""
    first_tp = sig.tps[0] if sig.tps else None
    if sig.is_buy:
        price = ask
        if price <= sig.sl:
            return EntryDecision("skip", reason=f"prezzo {price} già sotto lo stop {sig.sl}")
        if price <= sig.entry_high:
            return EntryDecision("market", price)
        if first_tp is not None and price >= first_tp:
            return EntryDecision("skip", reason=f"prezzo {price} già oltre il TP1 {first_tp}")
        return EntryDecision("limit", sig.entry_high, f"prezzo {price} sopra il range, BUY LIMIT")
    price = bid
    if price >= sig.sl:
        return EntryDecision("skip", reason=f"prezzo {price} già sopra lo stop {sig.sl}")
    if price >= sig.entry_low:
        return EntryDecision("market", price)
    if first_tp is not None and price <= first_tp:
        return EntryDecision("skip", reason=f"prezzo {price} già oltre il TP1 {first_tp}")
    return EntryDecision("limit", sig.entry_low, f"prezzo {price} sotto il range, SELL LIMIT")


def floor_to_step(volume: float, step: float) -> float:
    steps = math.floor(volume / step + 1e-9)
    return round(steps * step, 8)


def lot_for_risk(balance: float, risk_percent: float, loss_per_lot: float) -> float:
    """Lotti totali tali che, se tutte le posizioni prendono lo stop, si perde risk_percent del saldo."""
    if loss_per_lot <= 0:
        raise ValueError("perdita per lotto non valida")
    return balance * risk_percent / 100.0 / loss_per_lot


def build_legs(sig: Signal, targets, total_lot: float, vol_min: float,
               vol_step: float, vol_max: float):
    """Divide total_lot in posizioni uguali, una per ogni target scelto.
    targets: lista di numeri di TP (1-based) e/o "OPEN".
    Ritorna [(nome_leg, tp_price_or_None, lotti)]. Se i lotti non bastano per tutti i
    target, tiene solo i primi; se non basta nemmeno il lotto minimo ritorna []."""
    chosen = []
    for t in targets:
        if str(t).upper() == "OPEN":
            if sig.open_tp:
                chosen.append(("OPEN", None))
        else:
            i = int(t)
            if 1 <= i <= len(sig.tps):
                chosen.append((f"TP{i}", sig.tps[i - 1]))
    if not chosen:
        return []

    n = min(len(chosen), int(total_lot / vol_min + 1e-9))
    while n > 0:
        per_leg = min(floor_to_step(total_lot / n, vol_step), vol_max)
        if per_leg >= vol_min:
            return [(name, tp, per_leg) for name, tp in chosen[:n]]
        n -= 1
    return []
