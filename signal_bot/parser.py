"""Riconosce i segnali del gruppo Telegram e li trasforma in un oggetto Signal."""
import re
from dataclasses import dataclass, field

_NUM = r"\d+(?:[.,]\d+)?"
_DASH = r"[-–—/]"

_HEADER_RE = re.compile(
    r"\b(BUY|SELL)\b\s+(?:su\s+)?([A-Z0-9.]+)(?:\s*\(\s*([A-Z0-9.]+)\s*\))?",
    re.IGNORECASE,
)
_ENTRY_RE = re.compile(rf"Entry\s*:?\s*({_NUM})(?:\s*{_DASH}\s*({_NUM}))?", re.IGNORECASE)
_STOP_RE = re.compile(rf"\b(?:Stop(?:\s*Loss)?|SL)\b\s*:?\s*({_NUM})", re.IGNORECASE)
_TP_RE = re.compile(rf"\bTP\s*(\d+)\s*(?:{_DASH}|:)?\s*({_NUM}|OPEN)\b", re.IGNORECASE)


@dataclass
class Signal:
    direction: str            # "BUY" o "SELL"
    symbol: str               # es. "XAUUSD" (il simbolo tra parentesi ha la precedenza)
    entry_low: float
    entry_high: float
    sl: float
    tps: list = field(default_factory=list)   # TP numerici, in ordine (TP1, TP2, ...)
    open_tp: bool = False     # True se c'è un "TP n — OPEN"

    @property
    def is_buy(self) -> bool:
        return self.direction == "BUY"


class SignalError(ValueError):
    pass


def _f(s: str) -> float:
    return float(s.replace(",", "."))


def parse_signal(text: str):
    """Restituisce un Signal, None se il messaggio non è un segnale,
    oppure solleva SignalError se sembra un segnale ma è incoerente."""
    header = _HEADER_RE.search(text)
    entry = _ENTRY_RE.search(text)
    stop = _STOP_RE.search(text)
    if not (header and entry and stop):
        return None

    direction = header.group(1).upper()
    symbol = (header.group(3) or header.group(2)).upper()

    a = _f(entry.group(1))
    b = _f(entry.group(2)) if entry.group(2) else a
    entry_low, entry_high = min(a, b), max(a, b)
    sl = _f(stop.group(1))

    numbered = []
    open_tp = False
    for m in _TP_RE.finditer(text):
        if m.group(2).upper() == "OPEN":
            open_tp = True
        else:
            numbered.append((int(m.group(1)), _f(m.group(2))))
    tps = [price for _, price in sorted(numbered)]

    sig = Signal(direction, symbol, entry_low, entry_high, sl, tps, open_tp)
    _validate(sig)
    return sig


def _validate(sig: Signal) -> None:
    if not sig.tps and not sig.open_tp:
        raise SignalError("nessun take profit trovato")
    if sig.is_buy:
        if sig.sl >= sig.entry_low:
            raise SignalError(f"BUY con stop {sig.sl} non sotto l'entry {sig.entry_low}")
        if any(tp <= sig.entry_high for tp in sig.tps):
            raise SignalError("BUY con take profit non sopra l'entry")
    else:
        if sig.sl <= sig.entry_high:
            raise SignalError(f"SELL con stop {sig.sl} non sopra l'entry {sig.entry_high}")
        if any(tp >= sig.entry_low for tp in sig.tps):
            raise SignalError("SELL con take profit non sotto l'entry")
