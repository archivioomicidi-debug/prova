# Grazie al Cactus · sito vetrina con ordini su WhatsApp

Sito statico (HTML, CSS e JavaScript senza dipendenze né server). Presenta i pezzi, e ogni ordine o richiesta si completa su WhatsApp con un messaggio già scritto.

## Struttura

- **Hero e valori**: chi siamo in due frasi e quattro punti di forza.
- **I pezzi**: le foto dei pezzi disponibili, con prezzo e pulsante "Ordina su WhatsApp". Ogni pezzo è unico; quando è venduto resta visibile con l'etichetta "Venduto".
- **Su misura**: un modulo breve (contenitore, idea, dedica) che apre WhatsApp o l'email con la richiesta già scritta.
- **Come nascono** e **Cura**: contenuto che dà fiducia e riduce le domande.
- **Domande frequenti**: ordine, pagamento, spedizione, tempi, regali.
- **Contatti**: WhatsApp, email, Instagram, Facebook, con numero e indirizzo in chiaro.

Nessun carrello, nessun pagamento online, nessun dato salvato: la vendita si chiude in chat.

## File

- `index.html` – la pagina.
- `products.js` – **catalogo e prezzi**. È l'unico file da toccare per aggiornare i pezzi.
- `script.js` – contatti (WhatsApp, email, social), pulsanti d'ordine, modulo su misura, ingrandimento foto.
- `style.css` – stile.
- `img/` – foto (`*-sm.jpg` per le card, versione grande per l'ingrandimento).
- `fonts/` – caratteri ospitati sul sito (nessuna richiesta a Google Fonts).
- `favicon.svg`, `robots.txt`.

## Gestione quotidiana

- **Pezzo venduto**: in `products.js` metti `sold: true`, oppure cancella la riga.
- **Nuovo pezzo**: copia un blocco in `products.js` e metti le due foto in `img/` (verticali 3:4, circa 1200×1600 e 600×800).
- **Prezzi**: sempre in `products.js`. Togli la riga `price` per mostrare "Prezzo su richiesta".

## Prima di pubblicare

1. In `script.js` controlla numero WhatsApp, email e link social.
2. In `products.js` sostituisci i prezzi segnaposto.
3. In `index.html` sostituisci `https://www.grazie-al-cactus.it/` con il dominio vero (canonical, Open Graph, dati strutturati).
4. Verifica le risposte nelle Domande frequenti (pagamenti accettati, tempi, spedizione).

## Pubblicazione

Hosting statico gratuito: GitHub Pages (Settings → Pages → branch, cartella `/`), Netlify o Cloudflare Pages. Nessun build step.

Per provarlo in locale:

```bash
python3 -m http.server 8000
# poi apri http://localhost:8000
```

## Riutilizzo per altre attività

La struttura è generica: cambiando testi, foto, palette in `style.css` e il catalogo in `products.js` funziona per qualsiasi attività che vuole ricevere ordini o richieste su WhatsApp (ristoranti, artigiani, B&B, professionisti).
