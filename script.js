/* ==========================================================
   Grazie al Cactus · logica di pagina
   Modifica i contatti qui sotto: sono usati da tutti i pulsanti.
   Il catalogo e i prezzi sono in products.js.
   ========================================================== */

const CONTATTI = {
  // Numero WhatsApp in formato internazionale, senza + né spazi. Es: "393331234567"
  whatsapp: "39XXXXXXXXXX",
  email: "info@grazie-al-cactus.it",
  instagram: "https://www.instagram.com/grazie_al_cactus",
  facebook: "https://www.facebook.com/grazie.al.cactus",
};

const STORAGE_KEY = "gac-cart-v1";
const eur = (n) => "€ " + n.toFixed(2).replace(".", ",").replace(",00", "");
const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- Stato carrello ---------- */
let cart = [];
try { cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { cart = []; }
const saveCart = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch {} };

function addToCart(item) {
  cart.push({ ...item, key: Date.now() + Math.random().toString(16).slice(2) });
  saveCart();
  renderCart();
  renderProducts();
  showToast(`${item.name} aggiunto al carrello`);
}
function removeFromCart(key) {
  cart = cart.filter((i) => i.key !== key);
  saveCart();
  renderCart();
  renderProducts();
}
const inCart = (id) => cart.some((i) => i.type === "pronto" && i.id === id);

/* ---------- Toast ---------- */
let toastTimer;
function showToast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 2400);
}

/* ---------- Pezzi disponibili ---------- */
function renderProducts() {
  const grid = $("#product-grid");
  grid.innerHTML = PRODOTTI.map((p) => {
    const added = inCart(p.id);
    let action;
    if (p.sold) action = `<span class="sold-label">Venduto</span>`;
    else if (added) action = `<button type="button" class="btn btn-ghost btn-sm" data-open-cart>Nel carrello ✓</button>`;
    else action = `<button type="button" class="btn btn-primary btn-sm" data-add="${p.id}">Aggiungi al carrello</button>`;
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
            <span class="price">${eur(p.price)}</span>
            ${action}
          </div>
        </div>
      </article>`;
  }).join("");

  grid.querySelectorAll("[data-add]").forEach((b) => {
    b.addEventListener("click", () => {
      const p = PRODOTTI.find((x) => x.id === b.dataset.add);
      addToCart({ type: "pronto", id: p.id, name: p.name, price: p.price, qty: 1 });
    });
  });
  grid.querySelectorAll("[data-open-cart]").forEach((b) => b.addEventListener("click", openCart));
  bindLightbox(grid);
}

/* ---------- Configuratore ---------- */
function renderOptions(container, name, list, checkedId) {
  container.innerHTML = list.map((o, i) => `
    <label class="option">
      <input type="radio" name="${name}" value="${o.id}" ${(checkedId ? o.id === checkedId : i === 0) ? "checked" : ""}>
      <span class="option-box">
        <span class="option-label">${esc(o.label)}</span>
        ${o.note ? `<span class="option-note">${esc(o.note)}</span>` : ""}
        <span class="option-price">${o.price ? "+ " + eur(o.price) : (name === "consegna" ? "" : "incluso")}</span>
      </span>
    </label>`).join("");
}
const pick = (list, name) => list.find((o) => o.id === document.querySelector(`input[name="${name}"]:checked`)?.value) || list[0];

function customUnitPrice() {
  return pick(SU_MISURA.contenitori, "contenitore").price
       + pick(SU_MISURA.decorazioni, "decorazione").price
       + pick(SU_MISURA.piante, "pianta").price;
}
function updateCustomPrice() {
  const qty = Math.max(1, parseInt($("#cfg-qty").value, 10) || 1);
  $("#cfg-total").textContent = eur(customUnitPrice() * qty);
}
function initConfigurator() {
  renderOptions($("#opt-contenitore"), "contenitore", SU_MISURA.contenitori);
  renderOptions($("#opt-decorazione"), "decorazione", SU_MISURA.decorazioni);
  renderOptions($("#opt-pianta"), "pianta", SU_MISURA.piante);
  const form = $("#configurator");
  form.addEventListener("change", updateCustomPrice);
  form.addEventListener("input", updateCustomPrice);
  updateCustomPrice();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const c = pick(SU_MISURA.contenitori, "contenitore");
    const d = pick(SU_MISURA.decorazioni, "decorazione");
    const p = pick(SU_MISURA.piante, "pianta");
    const qty = Math.max(1, parseInt($("#cfg-qty").value, 10) || 1);
    const tema = $("#cfg-tema").value.trim();
    const dedica = $("#cfg-dedica").value.trim();
    const note = $("#cfg-note").value.trim();
    if (!tema && !note) {
      $("#cfg-tema").focus();
      showToast("Raccontaci almeno il tema o un'idea");
      return;
    }
    addToCart({
      type: "su-misura",
      name: "Pezzo su misura",
      price: customUnitPrice(),
      qty,
      dettagli: { contenitore: c.label, decorazione: d.label, pianta: p.label, tema, dedica, note },
    });
    form.reset();
    renderOptions($("#opt-contenitore"), "contenitore", SU_MISURA.contenitori);
    renderOptions($("#opt-decorazione"), "decorazione", SU_MISURA.decorazioni);
    renderOptions($("#opt-pianta"), "pianta", SU_MISURA.piante);
    updateCustomPrice();
    openCart();
  });
}

/* ---------- Carrello: rendering ---------- */
function shipping() { return pick(CONSEGNA, "consegna"); }
function totals() {
  const items = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const ship = cart.length ? shipping().price : 0;
  return { items, ship, grand: items + ship };
}
function renderCart() {
  const list = $("#cart-list");
  const empty = $("#cart-empty");
  const checkout = $("#checkout");
  const count = $("#cart-count");
  const n = cart.reduce((s, i) => s + i.qty, 0);
  count.textContent = n;
  count.hidden = n === 0;
  empty.hidden = cart.length > 0;
  checkout.hidden = cart.length === 0;

  list.innerHTML = cart.map((i) => {
    const det = i.type === "su-misura" ? `
      <ul class="cart-details">
        <li>${esc(i.dettagli.contenitore)} · ${esc(i.dettagli.decorazione)} · ${esc(i.dettagli.pianta)}</li>
        ${i.dettagli.tema ? `<li>Tema: ${esc(i.dettagli.tema)}</li>` : ""}
        ${i.dettagli.dedica ? `<li>Dedica: “${esc(i.dettagli.dedica)}”</li>` : ""}
        ${i.dettagli.note ? `<li>Note: ${esc(i.dettagli.note)}</li>` : ""}
      </ul>` : "";
    return `
      <li class="cart-item">
        <div class="cart-item-main">
          <strong>${esc(i.name)}${i.qty > 1 ? ` × ${i.qty}` : ""}</strong>
          <span class="price">${eur(i.price * i.qty)}</span>
        </div>
        ${det}
        <button type="button" class="link-btn" data-remove="${i.key}">Rimuovi</button>
      </li>`;
  }).join("");
  list.querySelectorAll("[data-remove]").forEach((b) => b.addEventListener("click", () => removeFromCart(b.dataset.remove)));

  const t = totals();
  $("#tot-items").textContent = eur(t.items);
  $("#tot-ship").textContent = t.ship ? eur(t.ship) : "gratis";
  $("#tot-grand").textContent = eur(t.grand);
  $("#co-indirizzo-wrap").hidden = shipping().id !== "spedizione";
  $("#co-indirizzo").required = shipping().id === "spedizione";
}

/* ---------- Carrello: apertura / chiusura ---------- */
function openCart() {
  $("#cart-drawer").classList.add("is-open");
  $("#cart-drawer").setAttribute("aria-hidden", "false");
  $("#drawer-backdrop").hidden = false;
  document.body.style.overflow = "hidden";
}
function closeCart() {
  $("#cart-drawer").classList.remove("is-open");
  $("#cart-drawer").setAttribute("aria-hidden", "true");
  $("#drawer-backdrop").hidden = true;
  document.body.style.overflow = "";
}

/* ---------- Invio ordine ---------- */
function buildOrderText() {
  const t = totals();
  const s = shipping();
  const lines = ["Ciao Grazie al Cactus! Vorrei ordinare:", ""];
  cart.forEach((i, n) => {
    lines.push(`${n + 1}) ${i.name}${i.qty > 1 ? ` × ${i.qty}` : ""} – ${eur(i.price * i.qty)}`);
    if (i.type === "su-misura") {
      const d = i.dettagli;
      lines.push(`   ${d.contenitore}, ${d.decorazione}, pianta: ${d.pianta}`);
      if (d.tema) lines.push(`   Tema: ${d.tema}`);
      if (d.dedica) lines.push(`   Dedica: "${d.dedica}"`);
      if (d.note) lines.push(`   Note: ${d.note}`);
    }
  });
  lines.push("", `Consegna: ${s.label}${t.ship ? ` (${eur(t.ship)})` : ""}`);
  if (s.id === "spedizione") lines.push(`Indirizzo: ${$("#co-indirizzo").value.trim()}`);
  lines.push(`Totale: ${eur(t.grand)}`, "");
  lines.push(`Nome: ${$("#co-nome").value.trim()}`, `Telefono: ${$("#co-tel").value.trim()}`);
  const note = $("#co-note").value.trim();
  if (note) lines.push(`Note: ${note}`);
  return lines.join("\n");
}
function initCheckout() {
  renderOptions($("#opt-consegna"), "consegna", CONSEGNA);
  const form = $("#checkout");
  form.addEventListener("change", renderCart);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    window.open(`https://wa.me/${CONTATTI.whatsapp}?text=${encodeURIComponent(buildOrderText())}`, "_blank", "noopener");
    showToast("Ordine preparato su WhatsApp: invialo e ti rispondiamo noi");
  });
  form.querySelector('[data-channel="email"]').addEventListener("click", () => {
    if (!form.reportValidity()) return;
    const subject = encodeURIComponent("Ordine Grazie al Cactus");
    window.location.href = `mailto:${CONTATTI.email}?subject=${subject}&body=${encodeURIComponent(buildOrderText())}`;
  });
  $("#cart-clear").addEventListener("click", () => {
    if (!confirm("Svuotare il carrello?")) return;
    cart = []; saveCart(); renderCart(); renderProducts();
  });
}

/* ---------- Lightbox ---------- */
function bindLightbox(root) {
  const lightbox = $("#lightbox");
  root.querySelectorAll(".card-media").forEach((btn) => {
    btn.addEventListener("click", () => {
      $("#lightbox-img").src = btn.dataset.full;
      $("#lightbox-img").alt = btn.querySelector("img").alt;
      $("#lightbox-caption").textContent = btn.closest(".card").dataset.name || "";
      lightbox.hidden = false;
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
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!lightbox.hidden) close();
    else if ($("#cart-drawer").classList.contains("is-open")) closeCart();
  });
}

/* ---------- Avvio ---------- */
document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();

  document.querySelectorAll("[data-social]").forEach((a) => {
    const k = a.dataset.social;
    if (k === "whatsapp") a.href = `https://wa.me/${CONTATTI.whatsapp}`;
    else if (k === "email") a.href = `mailto:${CONTATTI.email}`;
    else if (CONTATTI[k]) a.href = CONTATTI[k];
  });

  renderProducts();
  initConfigurator();
  initCheckout();
  renderCart();
  initLightbox();

  $("#cart-btn").addEventListener("click", openCart);
  $("#cart-close").addEventListener("click", closeCart);
  $("#drawer-backdrop").addEventListener("click", closeCart);
});
