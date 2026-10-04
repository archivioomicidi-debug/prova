# Signal Bot: da Telegram a MetaTrader 5

Il bot legge i segnali del gruppo Telegram e li esegue in automatico su MetaTrader 5.

> ⚠️ **Usalo prima su un conto DEMO.** Di default il bot parte in `dry_run` (non apre ordini)
> e si rifiuta di operare su un conto reale (`allow_live: false`). Non è un consiglio finanziario:
> esegue quello che scrive il gruppo, e il rischio resta tuo.

## Formato dei segnali riconosciuto

```
📉 SELL su GOLD (XAUUSD)
💰 Entry: 4182-4185
🛑 Stop: 4191
✅ TP 1 — 4180
...
✅ TP 9 — OPEN
```

I messaggi che non sono segnali (commenti, "TP1 preso", ecc.) vengono ignorati.
Un segnale incoerente (ad esempio un SELL con lo stop sotto l'entry) viene scartato e ti arriva un avviso.

## Cosa fa con un segnale

1. **Entrata**
   - Se il prezzo è nel range di entry, oppure è migliore ma non ha ancora toccato lo stop, entra **a mercato**.
   - Se il prezzo si è già mosso verso i TP ma non ha raggiunto il TP1, piazza un **ordine limite** sul bordo del range. L'ordine viene cancellato dopo `pending_expiry_minutes`.
   - Se lo stop o il TP1 sono già stati toccati, **non entra**.
2. **Lotti.** Con `lot_mode: risk` calcola i lotti in modo che, se tutte le posizioni prendono lo stop, perdi `risk_percent` del saldo.
3. **Più TP.** Apre una posizione per ogni TP indicato in `tp_targets` (di default TP1, TP2, TP3 e una posizione "OPEN" senza TP), dividendo i lotti in parti uguali.
4. **Pareggio.** Quando il primo TP viene preso, sposta lo stop delle altre posizioni al prezzo d'entrata.
5. **Limiti.** Blocca i nuovi segnali oltre `max_open_signals` o se la perdita di oggi supera `max_daily_loss_percent`.
6. **Notifiche.** Ogni azione ti arriva su Telegram (di default nei "Messaggi salvati").

## Requisiti

- **Windows** (anche un VPS) con **MetaTrader 5** installato e aperto. La libreria Python di MT5 funziona solo su Windows.
- In MT5: *Strumenti → Opzioni → Expert Advisors → "Consenti trading algoritmico"*, e il pulsante **Algo Trading** attivo.
- Un conto **hedging**, per poter avere più posizioni sullo stesso simbolo.
- Python 3.10 o superiore.
- Le credenziali API di Telegram, da https://my.telegram.org → *API development tools*.

## Installazione

```bash
pip install -r requirements.txt
copy config.example.yaml config.yaml     # poi apri config.yaml e compilalo
python -m signal_bot.main --list-chats   # al primo avvio chiede numero e codice Telegram; mostra gli ID delle chat
```

Copia l'ID del gruppo in `telegram.chat` dentro `config.yaml`, poi avvia il bot:

```bash
python -m signal_bot.main
```

## Passaggi consigliati

1. Lascia `dry_run: true` per qualche giorno e controlla che le notifiche corrispondano ai segnali.
2. Imposta `dry_run: false` su un conto **demo** e lascialo girare per 2-4 settimane.
3. Solo se i risultati ti convincono, passa al conto reale con `allow_live: true` e un `risk_percent` basso.

## Note

- Se il simbolo sul tuo broker ha un suffisso (ad esempio `XAUUSDm`), impostalo in `symbol_suffix`.
- Lo stato dei segnali aperti viene salvato in `state.json`, quindi un riavvio non perde la gestione del pareggio.
- I file `config.yaml` e `*.session` contengono credenziali e sono esclusi da git: **non condividerli**.

## Test

```bash
pip install pytest pyyaml
python -m pytest
```
