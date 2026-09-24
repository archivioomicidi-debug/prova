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
  const list = $("#product-grid");
  list.innerHTML = PRODOTTI.map((p, i) => {
    const msg = `Ciao Grazie al Cactus! Vorrei ordinare "${p.name}"${p.price ? ` (${eur(p.price)})` : ""}. È ancora disponibile?`;
    const action = p.sold
      ? `<span class="sold">Venduto</span>`
      : `<a class="btn" href="${waLink(msg)}" target="_blank" rel="noopener">Ordina su WhatsApp ↗</a>`;
    return `
      <article class="piece${p.sold ? " is-sold" : ""}" data-name="${esc(p.name)}">
        <button class="piece-media" type="button" data-full="${p.img}.jpg" aria-label="Ingrandisci: ${esc(p.name)}">
          <img src="${p.img}-sm.jpg" alt="${esc(p.alt)}" loading="lazy" width="600" height="800">
        </button>
        <div class="piece-body">
          <span class="piece-n">${String(i + 1).padStart(2, "0")}</span>
          <span class="piece-tag">${esc(p.tag)}</span>
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.desc)}</p>
          <div class="piece-foot">
            <span class="piece-price">${p.price ? eur(p.price) : "Prezzo su richiesta"}</span>
            ${action}
          </div>
        </div>
      </article>`;
  }).join("");
  bindLightbox(list);
}

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
  root.querySelectorAll(".piece-media").forEach((btn) => {
    btn.addEventListener("click", () => {
      $("#lightbox-img").src = btn.dataset.full;
      $("#lightbox-img").alt = btn.querySelector("img").alt;
      $("#lightbox-caption").textContent = btn.closest(".piece").dataset.name || "";
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

  const emailLabel = $("#email-label");
  if (emailLabel) emailLabel.textContent = CONTATTI.email;
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
