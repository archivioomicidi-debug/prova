"""Avvio: python -m signal_bot.main [--config config.yaml] [--list-chats]"""
import argparse
import asyncio
import logging

import yaml
from telethon import TelegramClient, events

from .parser import SignalError, parse_signal
from .trader import Mt5Trader, TradeRefused

log = logging.getLogger("bot")


async def run(cfg: dict, list_chats: bool):
    tg = cfg["telegram"]
    client = TelegramClient(tg.get("session", "signal_bot"), int(tg["api_id"]), tg["api_hash"])
    await client.start()

    if list_chats:
        async for d in client.iter_dialogs():
            print(f"{d.id:>16}  {d.name}")
        return

    notify_chat = tg.get("notify_chat", "me")

    async def notify(text: str):
        log.info(text)
        try:
            await client.send_message(notify_chat, text)
        except Exception as e:  # una notifica fallita non deve fermare il bot
            log.warning("Notifica non inviata: %s", e)

    trader = Mt5Trader(cfg)
    await notify("🤖 " + trader.connect())

    @client.on(events.NewMessage(chats=tg["chat"]))
    async def on_message(event):
        text = event.raw_text or ""
        try:
            sig = parse_signal(text)
        except SignalError as e:
            await notify(f"⚠️ Segnale ignorato (incoerente): {e}\n\n{text[:300]}")
            return
        if sig is None:
            return
        sid = str(event.id)
        try:
            report = trader.execute(sig, sid)
            await notify(f"📨 Segnale {sid}\n{report}")
        except TradeRefused as e:
            await notify(f"⛔ Segnale {sid} ({sig.direction} {sig.symbol}) non eseguito: {e}")
        except Exception as e:
            log.exception("Errore eseguendo il segnale")
            await notify(f"❌ Errore sul segnale {sid}: {e}")

    async def monitor_loop():
        interval = cfg["trading"].get("monitor_seconds", 5)
        while True:
            await asyncio.sleep(interval)
            try:
                for note in trader.monitor():
                    await notify(note)
            except Exception:
                log.exception("Errore nel monitor")

    asyncio.create_task(monitor_loop())
    log.info("In ascolto su %s ...", tg["chat"])
    try:
        await client.run_until_disconnected()
    finally:
        trader.shutdown()


def main():
    ap = argparse.ArgumentParser(description="Copia i segnali da Telegram su MetaTrader 5")
    ap.add_argument("--config", default="config.yaml")
    ap.add_argument("--list-chats", action="store_true", help="mostra chat e ID, poi esce")
    args = ap.parse_args()
    with open(args.config, encoding="utf-8") as f:
        cfg = yaml.safe_load(f)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
        handlers=[logging.StreamHandler(), logging.FileHandler(cfg.get("log_file", "bot.log"), encoding="utf-8")],
    )
    asyncio.run(run(cfg, args.list_chats))


if __name__ == "__main__":
    main()
