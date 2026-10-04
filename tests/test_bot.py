import pytest

from signal_bot.parser import SignalError, parse_signal
from signal_bot.planner import build_legs, decide_entry, floor_to_step, lot_for_risk

SELL_GOLD = """📉 SELL su GOLD (XAUUSD)

💰 Entry: 4182-4185

🛑 Stop: 4191

🎯 Take Profits:

✅ TP 1 — 4180
✅ TP 2 — 4177
✅ TP 3 — 4175
✅ TP 4 — 4174
✅ TP 5 — 4171
✅ TP 6 — 4168
✅ TP 7 — 4164
✅ TP 8 — 4161
✅ TP 9 — OPEN

Solo a scopo educativo. Non è un consiglio finanziario. Il trading comporta rischi, usate solo fondi che potete permettervi di perdere.

Contenuto informativo. Non costituisce consulenza finanziaria né raccomandazione personalizzata. Il trading comporta rischi.
"""


def test_parse_real_message():
    s = parse_signal(SELL_GOLD)
    assert s.direction == "SELL"
    assert s.symbol == "XAUUSD"
    assert (s.entry_low, s.entry_high, s.sl) == (4182, 4185, 4191)
    assert s.tps == [4180, 4177, 4175, 4174, 4171, 4168, 4164, 4161]
    assert s.open_tp


def test_parse_buy_variant():
    text = SELL_GOLD.replace("SELL", "BUY").replace("📉", "📈")
    text = text.replace("Entry: 4182-4185", "Entry: 4160-4163").replace("Stop: 4191", "Stop: 4150")
    for i, v in enumerate([4180, 4177, 4175, 4174, 4171, 4168, 4164, 4161], 1):
        text = text.replace(f"TP {i} — {v}", f"TP {i} — {4165 + i * 2}")
    s = parse_signal(text)
    assert s.direction == "BUY" and s.sl == 4150 and s.tps[0] == 4167


def test_non_signal_messages_ignored():
    assert parse_signal("Buongiorno a tutti! Oggi mercato volatile") is None
    assert parse_signal("TP 1 preso ✅ +30 pips") is None


def test_inconsistent_signal_rejected():
    with pytest.raises(SignalError):
        parse_signal(SELL_GOLD.replace("Stop: 4191", "Stop: 4170"))


def test_entry_decisions_sell():
    s = parse_signal(SELL_GOLD)
    assert decide_entry(s, 4183.5, 4183.8).kind == "market"   # nel range
    assert decide_entry(s, 4187.0, 4187.3).kind == "market"   # prezzo migliore, sotto lo stop
    d = decide_entry(s, 4181.0, 4181.3)                        # già sceso, prima del TP1
    assert d.kind == "limit" and d.price == 4182
    assert decide_entry(s, 4179.0, 4179.3).kind == "skip"     # TP1 già superato
    assert decide_entry(s, 4191.5, 4191.8).kind == "skip"     # oltre lo stop


def test_lot_sizing_and_legs():
    s = parse_signal(SELL_GOLD)
    # 10.000 di saldo, 1% di rischio, 900 di perdita per lotto (9 punti oro a 100/punto)
    total = lot_for_risk(10_000, 1.0, 900)
    assert total == pytest.approx(0.1111, rel=1e-3)
    legs = build_legs(s, [1, 2, 3, "OPEN"], total, 0.01, 0.01, 100)
    assert [l[0] for l in legs] == ["TP1", "TP2", "TP3", "OPEN"]
    assert all(l[2] == 0.02 for l in legs)
    assert legs[0][1] == 4180 and legs[3][1] is None


def test_legs_reduced_when_lot_too_small():
    s = parse_signal(SELL_GOLD)
    legs = build_legs(s, [1, 2, 3, "OPEN"], 0.025, 0.01, 0.01, 100)
    assert [l[0] for l in legs] == ["TP1", "TP2"]
    assert build_legs(s, [1, 2], 0.005, 0.01, 0.01, 100) == []


def test_floor_to_step():
    assert floor_to_step(0.1 - 0.07, 0.01) == 0.03  # 0.030000000000000013 in float
    assert floor_to_step(0.037, 0.01) == 0.03
