# Passaggio su Shopify

Materiale per portare il sito Grazie al Cactus sul negozio Shopify.

## 1. Prodotti (5 minuti)

`prodotti.csv` contiene i nove pezzi con titolo, descrizione, prezzo, tag, foto e SEO.

Shopify admin → **Prodotti** → **Importa** → carica `prodotti.csv`. Le foto vengono scaricate da GitHub automaticamente.
Ogni pezzo ha quantità 1 e inventario tracciato: quando è venduto sparisce da solo.

Poi crea la collezione **Creazioni LattaViva** (Prodotti → Collezioni → Crea) di tipo automatica, regola: *Tag* è uguale a *LattaViva*.

## 2. Pagine (10 minuti)

Shopify admin → **Negozio online** → **Pagine** → **Aggiungi pagina**. Per ciascuna, apri l'editor in modalità HTML (icona `<>`) e incolla il file:

| Pagina | File | Titolo suggerito |
|---|---|---|
| Chi siamo | `pagine/lattaviva.html` | LattaViva |
| Come nascono | `pagine/come-nascono.html` | Come nascono |
| Cura | `pagine/cura.html` | Cura delle piante |
| Domande | `pagine/domande.html` | Domande frequenti |
| Su misura | `pagine/su-misura.html` | Su misura |

Poi **Navigazione** → menu principale: I pezzi (collezione), LattaViva, Su misura, Come nascono, Cura, Domande, Contatti.

## 3. Tema

Con il tema Dawn (gratuito) la homepage si compone da **Negozio online → Temi → Personalizza**:

1. **Banner immagine**: foto `img/farfalla-oro.jpg`, titolo "Dove la latta rinasce, l'arte respira, le piante grasse raccontano storie.", pulsante "Guarda i pezzi" → collezione.
2. **Collezione in evidenza**: Creazioni LattaViva.
3. **Testo con immagine**: il manifesto LattaViva (da `pagine/lattaviva.html`).
4. **Multicolonna**: le tre schede "Cosa troverai qui".
5. **Multicolonna**: le quattro tappe "Come nascono".
6. **Sezione FAQ** (in Dawn si chiama "Domande frequenti" o "Contenuto comprimibile"): le sei domande.
7. **Contatti**: sezione "Modulo di contatto" più un blocco testo con numero WhatsApp.

Colori del tema: sfondo `#fffdf8`, testo `#23221f`, accento 1 `#e0512f` (corallo), accento 2 `#3f8a35` (verde). Caratteri: titoli **Fraunces**, testo **Nunito** (entrambi disponibili nella libreria Shopify).

## 4. WhatsApp

Per il pulsante WhatsApp fisso installa un'app gratuita dallo store (cerca "WhatsApp chat button") oppure aggiungi questo blocco in **Personalizza → Impostazioni tema → Codice personalizzato**:

```html
<a href="https://wa.me/393289871514" target="_blank" rel="noopener" aria-label="Scrivici su WhatsApp"
   style="position:fixed;right:18px;bottom:18px;z-index:99;width:58px;height:58px;border-radius:50%;background:#25d366;display:grid;place-items:center;box-shadow:0 12px 30px rgba(0,0,0,.25)">
  <svg viewBox="0 0 24 24" width="28" height="28"><path fill="#073b1c" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4c.6.3 1.1.4 1.5.5a3.6 3.6 0 0 0 1.7-.1 2.6 2.6 0 0 0 1.5-1.1 2 2 0 0 0 .1-1.1c0-.1-.2-.2-.4-.3Z"/></svg>
</a>
```

## 5. Spedizioni e pagamenti

- **Impostazioni → Spedizione e consegna**: una tariffa per l'Italia (es. 8,90 €, gratis sopra 45 €) e l'opzione **Ritiro in sede** per la consegna a mano.
- **Impostazioni → Pagamenti**: attiva Shopify Payments (carte) e PayPal.
- **Impostazioni → Informative**: privacy, resi e termini si generano dai modelli Shopify.

## Nota

Con l'accesso al negozio collegato, prodotti, collezione e pagine si possono creare direttamente da qui senza importazioni manuali.

## Fatto via API il 28 settembre 2026

Negozio: xdjsad-tw.myshopify.com (graziealcactus@gmail.com), piano di prova.

- 9 prodotti attivi con foto, prezzo, SKU `GAC-*`, quantità 1, inventario tracciato, tag `LattaViva`.
- Collezione automatica **Creazioni LattaViva** (`/collections/creazioni-lattaviva`), regola: tag = LattaViva.
- Pagine: `/pages/lattaviva`, `/pages/su-misura`, `/pages/come-nascono`, `/pages/cura`, `/pages/domande-frequenti`.
- Menu principale e menu footer aggiornati.
- Tema **Grazie al Cactus v2** (id 205997932887, non pubblicato): homepage identica al sito locale.
  I file sono in `shopify/theme/`: `layout/gac.liquid`, `sections/gac-home.liquid`, `templates/index.json`,
  `assets/gac.css.liquid`, `assets/gac.js`, più font e miniature caricati come asset `gac-*`.
  I pezzi vengono dalla collezione Creazioni LattaViva; "Aggiungi al carrello" usa il carrello Shopify.
- Il tema **Grazie al Cactus** (id 205997375831) è quello pubblicato ora, composto con i blocchi di Horizon: da sostituire con v2.

## Da fare nell'admin (non possibile via API)

1. Negozio online → Temi → **Grazie al Cactus v2** → Anteprima, poi **Pubblica**.
2. Impostazioni → Generali → nome negozio "Grazie al Cactus".
3. Impostazioni → Spedizione e consegna, Pagamenti, Informative, Piano.
4. Personalizza → Intestazione: carica il logo; Piè di pagina: link social.
