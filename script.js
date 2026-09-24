/* ==========================================================
   Grazie al Cactus · logica di pagina
   Modifica i contatti qui sotto: sono usati da tutti i pulsanti.
   Il catalogo è in products.js.
   ========================================================== */

const CONTATTI = {
  // Numero WhatsApp in formato internazionale, senza + né spazi. Es: "393331234567"
  whatsapp: "393289871514",
  email: "info@grazie-al-cactus.it",
  instagram: "https://www.instagram.com/grazie_al_cactus",
  facebook: "https://www.facebook.com/grazie.al.cactus",
};

const $ = (sel) => document.querySelector(sel);
const eur = (n) => "€ " + n.toFixed(2).replace(".", ",").replace(",00", "");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const waLink = (text) => `https://wa.me/${CONTATTI.whatsapp}?text=${encodeURIComponent(text)}`;

/* ---------- Vetrina ---------- */
function renderProducts() {
  const grid = $("#product-grid");
  grid.innerHTML = PRODOTTI.map((p) => {
    const msg = `Ciao Grazie al Cactus! Vorrei ordinare "${p.name}"${p.price ? ` (${eur(p.price)})` : ""}. È ancora disponibile?`;
    const action = p.sold
      ? `<span class="sold-label">Venduto</span>`
      : `<a class="btn btn-wa btn-sm" href="${waLink(msg)}" target="_blank" rel="noopener">${WA_ICON} Ordina su WhatsApp</a>`;
    return `
      <article class="card${p.sold ? " is-sold" : ""}" data-name="${esc(p.name)}">
        <button class="card-media" type="button" data-full="${p.img}.jpg" aria-label="Ingrandisci: ${esc(p.name)}">
          <img src="${p.img}-sm.jpg" alt="${esc(p.alt)}" loading="lazy" width="600" height="800">
          ${p.sold ? `<span class="sold-badge">Venduto</span>` : ""}
        </button>
        <div class="card-body">
          <span class="tag">${esc(p.tag)}</span>
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.desc)}</p>
          <div class="card-foot">
            ${p.price ? `<span class="price">${eur(p.price)}</span>` : `<span class="price muted small">Prezzo su richiesta</span>`}
            ${action}
          </div>
        </div>
      </article>`;
  }).join("");
  bindLightbox(grid);
}

const WA_ICON = `<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4c.6.3 1.1.4 1.5.5a3.6 3.6 0 0 0 1.7-.1 2.6 2.6 0 0 0 1.5-1.1 2 2 0 0 0 .1-1.1c0-.1-.2-.2-.4-.3Z"/></svg>`;

/* ---------- Su misura ---------- */
function initCustomForm() {
  const form = $("#custom-form");
  const build = () => {
    const tipo = form.querySelector('input[name="tipo"]:checked')?.value || "";
    const idea = $("#cf-idea").value.trim();
    const dedica = $("#cf-dedica").value.trim();
    const lines = ["Ciao Grazie al Cactus! Vorrei un pezzo su misura."];
    if (tipo) lines.push(`Contenitore: ${tipo}`);
    if (idea) lines.push(`Idea: ${idea}`);
    if (dedica) lines.push(`Dedica: "${dedica}"`);
    lines.push("Mi dite prezzo e tempi?");
    return lines.join("\n");
  };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!$("#cf-idea").value.trim()) { $("#cf-idea").focus(); return; }
    window.open(waLink(build()), "_blank", "noopener");
  });
  form.querySelector('[data-channel="email"]').addEventListener("click", () => {
    if (!$("#cf-idea").value.trim()) { $("#cf-idea").focus(); return; }
    window.location.href = `mailto:${CONTATTI.email}?subject=${encodeURIComponent("Richiesta pezzo su misura")}&body=${encodeURIComponent(build())}`;
  });
}

/* ---------- Lightbox ---------- */
function bindLightbox(root) {
  root.querySelectorAll(".card-media").forEach((btn) => {
    btn.addEventListener("click", () => {
      $("#lightbox-img").src = btn.dataset.full;
      $("#lightbox-img").alt = btn.querySelector("img").alt;
      $("#lightbox-caption").textContent = btn.closest(".card").dataset.name || "";
      $("#lightbox").hidden = false;
      document.body.style.overflow = "hidden";
    });
  });
}
function initLightbox() {
  const lightbox = $("#lightbox");
  const close = () => { lightbox.hidden = true; $("#lightbox-img").src = ""; document.body.style.overflow = ""; };
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.classList.contains("lightbox-close")) close();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !lightbox.hidden) close(); });
}

/* ---------- Avvio ---------- */
document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();

  document.querySelectorAll("[data-social]").forEach((a) => {
    const k = a.dataset.social;
    if (k === "whatsapp") a.href = waLink("Ciao Grazie al Cactus! Avrei una domanda.");
    else if (k === "email") a.href = `mailto:${CONTATTI.email}`;
    else if (CONTATTI[k]) a.href = CONTATTI[k];
  });

  renderProducts();
  initCustomForm();
  initLightbox();
});
