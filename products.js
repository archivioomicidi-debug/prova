/* ==========================================================
   Grazie al Cactus · catalogo
   Qui modifichi i pezzi disponibili e le opzioni su misura.
   I PREZZI SONO SEGNAPOSTO: sostituiscili con quelli reali.
   ========================================================== */

// Pezzi già creati. Ogni pezzo è unico: quando lo vendi, metti sold: true
// (resta visibile con l'etichetta "Venduto") oppure cancella la riga.
const PRODOTTI = [
  {
    id: "brilla-sempre",
    name: "Brilla sempre",
    tag: "Con dedica",
    price: 22,
    img: "img/brilla-sempre",
    alt: "Due latte decorate: una dorata con un cactus colonnare e una blu con stelle argentate e la scritta Brilla sempre",
    desc: "Latta blu notte con stelle in rilievo e scritta a mano, con cactus colonnare. Altezza circa 10 cm.",
    sold: false,
  },
  {
    id: "oro-grezzo",
    name: "Oro grezzo",
    tag: "Effetto pietra",
    price: 20,
    img: "img/brilla-sempre",
    alt: "Latta dorata con finitura effetto pietra e un cactus colonnare",
    desc: "Latta piccola con finitura oro e rilievi effetto roccia, con due cactus colonnari. Altezza circa 10 cm.",
    sold: false,
  },
  {
    id: "barattolo-verde",
    name: "Il barattolo verde",
    tag: "Iconico",
    price: 24,
    img: "img/barattolo-verde",
    alt: "Barattolo di vetro dipinto verde metallizzato con il logo Grazie al Cactus e un cactus ramificato",
    desc: "Vetro recuperato, finitura verde metallizzata e il nostro logo. Con euphorbia ramificata. Altezza circa 14 cm.",
    sold: false,
  },
  {
    id: "fiori-vintage",
    name: "Fiori vintage",
    tag: "Formato grande",
    price: 32,
    img: "img/fiori-vintage",
    alt: "Latta grande con découpage di peonie bianche e viola scuro, con opuntia e cactus tondo, coperchio decorato",
    desc: "Peonie bianche e prugna in découpage su latta grande, con il coperchio decorato che fa da sfondo. Opuntia e cactus tondo.",
    sold: false,
  },
  {
    id: "rose-antiche",
    name: "Rose antiche",
    tag: "Romantico",
    price: 30,
    img: "img/rose-antiche",
    alt: "Latta con découpage di rose rosa e coperchio con una rosa, con haworthia e collana di perle",
    desc: "Rose in stile botanico e bordo rosa, coperchio decorato. Dentro, una haworthia e una collana di perle.",
    sold: false,
  },
  {
    id: "streghe",
    name: "Le streghe (coppia)",
    tag: "Edizione Halloween",
    price: 36,
    img: "img/streghe-gotiche",
    alt: "Due barattoli di vetro con découpage di streghe in stile vintage, uno viola e uno seppia, con cactus e haworthia",
    desc: "Due barattoli in vetro con illustrazioni gotiche e finitura invecchiata. Venduti in coppia.",
    sold: false,
  },
];

// Opzioni del configuratore su misura. Il prezzo finale è
// base + decorazione + pianta, per la quantità scelta.
const SU_MISURA = {
  contenitori: [
    { id: "vetro", label: "Barattolo di vetro", price: 18, note: "circa 12–14 cm" },
    { id: "latta-s", label: "Latta piccola", price: 20, note: "circa 10 cm" },
    { id: "latta-l", label: "Latta grande", price: 26, note: "circa 15 cm, più piante" },
  ],
  decorazioni: [
    { id: "dipinto", label: "Dipinto a mano", price: 0 },
    { id: "decoupage", label: "Découpage con immagine", price: 4 },
    { id: "scritta", label: "Dipinto con scritta o dedica in rilievo", price: 5 },
    { id: "decoupage-scritta", label: "Découpage + dedica", price: 8 },
  ],
  piante: [
    { id: "cactus", label: "Cactus", price: 0 },
    { id: "succulenta", label: "Succulenta a foglia", price: 0 },
    { id: "mix", label: "Mix di più piante", price: 3 },
    { id: "libera", label: "Scegliete voi", price: 0 },
  ],
};

// Consegna
const CONSEGNA = [
  { id: "ritiro", label: "Ritiro a mano (gratis)", price: 0 },
  { id: "spedizione", label: "Spedizione in Italia", price: 7.9 },
];
