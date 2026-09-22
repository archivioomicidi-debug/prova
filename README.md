# Grazie al Cactus · sito con carrello

Sito statico (HTML, CSS e JavaScript senza dipendenze né server) per vendere cactus e piante grasse in barattoli recuperati e decorati a mano.

## Cosa fa

- **Disponibili ora**: i pezzi già creati, con prezzo e "Aggiungi al carrello". Ogni pezzo è unico (quantità 1).
- **Su misura**: configuratore (contenitore, decorazione, pianta, tema, dedica, note, quantità) con prezzo calcolato in tempo reale.
- **Carrello**: pannello laterale con riepilogo, scelta consegna (ritiro o spedizione), dati cliente e totale. Resta salvato nel browser del cliente.
- **Invio ordine**: l'ordine si apre come messaggio già scritto su WhatsApp (o email). Il pagamento si concorda in chat: nessun addebito online.

## File

- `index.html` – la pagina.
- `products.js` – **catalogo e prezzi**: pezzi disponibili, opzioni su misura, costi di consegna. È l'unico file da toccare per aggiornare il negozio.
- `script.js` – contatti (WhatsApp, email, social) e logica di carrello, configuratore, lightbox.
- `style.css` – stile.
- `img/` – foto (`*-sm.jpg` per le card, versione grande per l'ingrandimento).

## Gestione quotidiana

- **Vendere un pezzo**: in `products.js` metti `sold: true` sul pezzo (resta visibile con "Venduto") oppure cancella la riga.
- **Aggiungere un pezzo**: copia un blocco in `PRODOTTI`, metti le due foto in `img/` (verticali 3:4, circa 1200×1600 e 600×800).
- **Cambiare prezzi o opzioni**: sempre in `products.js`.

## Prima di pubblicare

1. In `script.js` inserisci numero WhatsApp (formato internazionale senza `+`), email e link social reali.
2. In `products.js` sostituisci i prezzi segnaposto con quelli veri.

## Pubblicazione

Hosting statico gratuito: GitHub Pages (Settings → Pages → branch, cartella `/`), Netlify o Cloudflare Pages. Nessun build step.

Per provarlo in locale:

```bash
python3 -m http.server 8000
# poi apri http://localhost:8000
```

## Pagamenti online (passo successivo, se servirà)

Il flusso attuale chiude la vendita in chat. Se in futuro vuoi incassare direttamente sul sito, le strade più semplici sono i **Payment Link di Stripe o PayPal** per i pezzi disponibili, oppure un negozio Shopify dedicato: entrambi si integrano in questa pagina senza rifarla.
