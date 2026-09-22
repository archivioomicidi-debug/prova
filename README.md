# Grazie al Cactus · sito vetrina

Sito statico (HTML, CSS e JavaScript senza dipendenze) che presenta i cactus e le piante grasse in barattoli recuperati e decorati a mano.

## Struttura

- `index.html` – la pagina: hero, valori, collezione, come nascono, cura, contatti.
- `style.css` – stile e palette (verde cactus, corallo, giallo sole).
- `script.js` – contatti, modulo WhatsApp/email, lightbox.
- `img/` – foto dei pezzi, già ridimensionate (`*-sm.jpg` per le card, la versione grande per l'ingrandimento).

## Prima di pubblicare

1. In `script.js` inserisci il numero WhatsApp, l'email e i link social reali.
2. Aggiungi o togli pezzi nella sezione `#collezione` di `index.html`, copiando una `<article class="card">`.
3. Metti le nuove foto in `img/` (ideale: verticali 3:4, circa 1200×1600 px).

## Pubblicazione

Basta un hosting statico: GitHub Pages (Settings → Pages → branch `main`, cartella `/`), Netlify o Cloudflare Pages. Nessun build step.

Per provarlo in locale:

```bash
python3 -m http.server 8000
# poi apri http://localhost:8000
```
