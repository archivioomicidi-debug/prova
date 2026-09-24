/* ==========================================================
   Grazie al Cactus · logica di pagina
   Modifica i contatti qui sotto: sono usati da tutti i pulsanti.
   Il catalogo è in products.js.
   ========================================================== */

const CONTATTI = {
  // Numero WhatsApp in formato internazionale, senza + né spazi.
  whatsapp: "393289871514",
  whatsappLabel: "+39 328 987 1514",
  email: "info@grazie-al-cactus.it",
  instagram: "https://www.instagram.com/grazie_al_cactus",
  instagramLabel: "@grazie_al_cactus",
  facebook: "https://www.facebook.com/grazie.al.cactus",
};

const $ = (sel) => document.querySelector(sel);
const eur = (n) => "€ " + n.toFixed(2).replace(".", ",").replace(",00", "");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const waLink = (text) => `https://wa.me/${CONTATTI.whatsapp}?text=${encodeURIComponent(text)}`;
const pageUrl = () => location.origin + location.pathname;

const WA_ICON = `<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4c.6.3 1.1.4 1.5.5a3.6 3.6 0 0 0 1.7-.1 2.6 2.6 0 0 0 1.5-1.1 2 2 0 0 0 .1-1.1c0-.1-.2-.2-.4-.3Z"/></svg>`;

/* ---------- Vetrina ---------- */
function renderProducts() {
  const grid = $("#product-grid");
  grid.innerHTML = PRODOTTI.map((p, i) => {
    const msg = `Ciao Grazie al Cactus! Vorrei ordinare "${p.name}"${p.price ? ` (${eur(p.price)})` : ""}. È ancora disponibile?\n${pageUrl()}#p-${p.id}`;
    const action = p.sold
      ? `<span class="sold-label">Venduto</span>`
      : `<a class="btn btn-wa btn-sm" href="${waLink(msg)}" target="_blank" rel="noopener">${WA_ICON} Ordina su WhatsApp</a>`;
    return `
      <article class="card${p.sold ? " is-sold" : ""}" id="p-${p.id}" data-index="${i}" data-name="${esc(p.name)}">
        <button class="card-media" type="button" data-full="${p.img}.jpg" aria-label="Ingrandisci: ${esc(p.name)}">
          <img src="${p.img}-sm.jpg" alt="${esc(p.alt)}" loading="${i < 3 ? "eager" : "lazy"}" decoding="async" width="600" height="800">
          ${p.sold ? `<span class="sold-badge">Venduto</span>` : ""}
        </button>
        <div class="card-body">
          <span class="tag">${esc(p.tag)}</span>
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.desc)}</p>
          <div class="card-foot">
            ${p.price ? `<span class="price">${eur(p.price)}</span>` : `<span class="price price-ask">Prezzo su richiesta</span>`}
            ${action}
          </div>
        </div>
      </article>`;
  }).join("");
  bindLightbox(grid);
  injectProductSchema();
}

// Dati strutturati per Google (schede prodotto nei risultati di ricerca)
function injectProductSchema() {
  const items = PRODOTTI.filter((p) => !p.sold).map((p) => ({
    "@type": "Product",
    name: p.name,
    description: p.desc,
    image: `${pageUrl()}${p.img}.jpg`,
    url: `${pageUrl()}#p-${p.id}`,
    brand: { "@type": "Brand", name: "Grazie al Cactus" },
    ...(p.price ? { offers: { "@type": "Offer", price: p.price, priceCurrency: "EUR", availability: "https://schema.org/InStock" } } : {}),
  }));
  const s = document.createElement("script");
  s.type = "application/ld+json";
  s.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "ItemList", itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, item })) });
  document.head.appendChild(s);
}

/* ---------- Su misura ---------- */
function initCustomForm() {
  const form = $("#custom-form");
  const idea = $("#cf-idea");
  const err = $("#cf-idea-err");
  const build = () => {
    const tipo = form.querySelector('input[name="tipo"]:checked')?.value || "";
    const dedica = $("#cf-dedica").value.trim();
    const lines = ["Ciao Grazie al Cactus! Vorrei un pezzo su misura."];
    if (tipo) lines.push(`Contenitore: ${tipo}`);
    lines.push(`Idea: ${idea.value.trim()}`);
    if (dedica) lines.push(`Dedica: "${dedica}"`);
    lines.push("Mi dite prezzo e tempi?");
    return lines.join("\n");
  };
  const valid = () => {
    const ok = idea.value.trim().length >= 3;
    err.hidden = ok;
    idea.setAttribute("aria-invalid", ok ? "false" : "true");
    if (!ok) idea.focus();
    return ok;
  };
  idea.addEventListener("input", () => { if (idea.value.trim().length >= 3) { err.hidden = true; idea.removeAttribute("aria-invalid"); } });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!valid()) return;
    window.open(waLink(build()), "_blank", "noopener");
  });
  form.querySelector('[data-channel="email"]').addEventListener("click", () => {
    if (!valid()) return;
    window.location.href = `mailto:${CONTATTI.email}?subject=${encodeURIComponent("Richiesta pezzo su misura")}&body=${encodeURIComponent(build())}`;
  });
}

/* ---------- Menu mobile ---------- */
function initNav() {
  const toggle = $(".nav-toggle");
  const nav = $("#nav");
  const set = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
    nav.classList.toggle("is-open", open);
  };
  toggle.addEventListener("click", () => set(toggle.getAttribute("aria-expanded") !== "true"));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
}

/* ---------- Lightbox ---------- */
let lbIndex = 0;
let lbReturnFocus = null;
function showLightbox(i) {
  const list = PRODOTTI;
  lbIndex = (i + list.length) % list.length;
  const p = list[lbIndex];
  $("#lightbox-img").src = `${p.img}.jpg`;
  $("#lightbox-img").alt = p.alt;
  $("#lightbox-caption").textContent = p.name;
}
function openLightbox(i, from) {
  lbReturnFocus = from || null;
  showLightbox(i);
  $("#lightbox").hidden = false;
  document.body.style.overflow = "hidden";
  $(".lightbox-close").focus();
}
function closeLightbox() {
  $("#lightbox").hidden = true;
  $("#lightbox-img").src = "";
  document.body.style.overflow = "";
  if (lbReturnFocus) lbReturnFocus.focus();
}
function bindLightbox(root) {
  root.querySelectorAll(".card-media").forEach((btn) => {
    btn.addEventListener("click", () => openLightbox(Number(btn.closest(".card").dataset.index), btn));
  });
}
function initLightbox() {
  const lb = $("#lightbox");
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  $(".lightbox-close").addEventListener("click", closeLightbox);
  $(".lightbox-prev").addEventListener("click", () => showLightbox(lbIndex - 1));
  $(".lightbox-next").addEventListener("click", () => showLightbox(lbIndex + 1));
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") showLightbox(lbIndex - 1);
    else if (e.key === "ArrowRight") showLightbox(lbIndex + 1);
    else if (e.key === "Tab") {
      // tieni il focus dentro la finestra
      const f = [...lb.querySelectorAll("button")];
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // scorrimento col dito
  let x0 = null;
  lb.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) showLightbox(lbIndex + (dx < 0 ? 1 : -1));
    x0 = null;
  });
}

/* ---------- Avvio ---------- */
document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();
  const avail = PRODOTTI.filter((p) => !p.sold).length;
  const cnt = $("#count-available");
  if (cnt) { cnt.textContent = avail; cnt.parentElement.lastChild.textContent = avail === 1 ? " pezzo disponibile ora" : " pezzi disponibili ora"; }
  $("#phone-label").textContent = CONTATTI.whatsappLabel;
  $("#email-label").textContent = CONTATTI.email;
  $("#instagram-label").textContent = CONTATTI.instagramLabel;

  document.querySelectorAll("[data-social]").forEach((a) => {
    const k = a.dataset.social;
    if (k === "whatsapp") a.href = waLink("Ciao Grazie al Cactus! Avrei una domanda.");
    else if (k === "email") a.href = `mailto:${CONTATTI.email}`;
    else if (CONTATTI[k]) a.href = CONTATTI[k];
  });

  renderProducts();
  initCustomForm();
  initNav();
  initLightbox();

  // Se il link arriva con #p-nome, evidenzia il pezzo
  if (location.hash.startsWith("#p-")) {
    const el = document.getElementById(location.hash.slice(1));
    if (el) { el.classList.add("is-linked"); el.scrollIntoView({ block: "center" }); }
  }
});
