/* ==========================================================
   Grazie al Cactus · logica di pagina
   Modifica i contatti qui sotto: sono usati da tutti i pulsanti.
   Il catalogo è in products.js.
   ========================================================== */

const CONTATTI = {
  // Numero WhatsApp in formato internazionale, senza + né spazi.
  whatsapp: "393289871514",
  whatsappLabel: "+39 328 987 1514",
  email: "graziealcactus@gmail.com",
  instagram: "https://www.instagram.com/grazie_al_cactus",
  instagramLabel: "@grazie_al_cactus",
  facebook: "https://www.facebook.com/grazie.al.cactus",
};

const $ = (sel) => document.querySelector(sel);
const eur = (n) => "€ " + n.toFixed(2).replace(".", ",").replace(",00", "");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const waLink = (text) => `https://wa.me/${CONTATTI.whatsapp}?text=${encodeURIComponent(text)}`;

const WA_ICON = `<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4c.6.3 1.1.4 1.5.5a3.6 3.6 0 0 0 1.7-.1 2.6 2.6 0 0 0 1.5-1.1 2 2 0 0 0 .1-1.1c0-.1-.2-.2-.4-.3Z"/></svg>`;

/* ---------- Carrello (Shopify) ---------- */
function showToast(html) {
  const t = $("#toast");
  t.innerHTML = html;
  t.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { t.hidden = true; }, 3500);
}
function updateCartCount(n) {
  const c = $("#cart-count");
  if (!c) return;
  c.textContent = n;
  c.hidden = n === 0;
}
function initCart() {
  document.querySelectorAll(".add-form").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector("button");
      btn.disabled = true;
      try {
        const res = await fetch("/cart/add.js", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ items: [{ id: Number(form.querySelector('[name="id"]').value), quantity: 1 }] }),
        });
        if (!res.ok) throw new Error((await res.json()).description || "Errore");
        const cart = await (await fetch("/cart.js")).json();
        updateCartCount(cart.item_count);
        showToast(`${form.dataset.title} aggiunto al carrello · <a href="/cart">Vai al carrello</a>`);
      } catch (err) {
        showToast(err.message || "Non è stato possibile aggiungere il pezzo.");
      } finally {
        btn.disabled = false;
      }
    });
  });
}

/* ---------- Su misura ---------- */
function initCustomForm() {
  const form = $("#custom-form");
  const idea = $("#cf-idea");
  const err = $("#cf-idea-err");
  const summary = $("#wizard-summary");
  const picked = (name) => form.querySelector(`input[name="${name}"]:checked`)?.value || "";
  const build = () => {
    const dedica = $("#cf-dedica").value.trim();
    const occasione = $("#cf-occasione").value.trim();
    const lines = ["Ciao Grazie al Cactus! Vorrei un pezzo su misura."];
    lines.push(`Base: ${picked("tipo")}`);
    lines.push(`Stile: ${picked("stile")}`);
    lines.push(`Idea: ${idea.value.trim()}`);
    if (dedica) lines.push(`Dedica: "${dedica}"`);
    if (occasione) lines.push(`Occasione: ${occasione}`);
    lines.push("Mi dite prezzo e tempi?");
    return lines.join("\n");
  };
  const updateSummary = () => {
    summary.textContent = `La tua scelta: ${picked("tipo").toLowerCase()}, ${picked("stile").toLowerCase()}.`;
  };
  form.addEventListener("change", updateSummary);
  updateSummary();
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
const lightboxItems = () => [...document.querySelectorAll(".gallery-media[data-full], #product-grid .card[data-full]")];
function showLightbox(i) {
  const list = lightboxItems();
  if (!list.length) return;
  lbIndex = (i + list.length) % list.length;
  const c = list[lbIndex];
  $("#lightbox-img").src = c.dataset.full;
  $("#lightbox-img").alt = c.dataset.alt || "";
  $("#lightbox-caption").textContent = c.dataset.name;
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
function bindLightbox() {
  const items = lightboxItems();
  items.forEach((el, i) => {
    const btn = el.matches(".gallery-media") ? el : el.querySelector(".card-media");
    if (btn) btn.addEventListener("click", () => openLightbox(i, btn));
  });
}
function initThumbs() {
  const main = $("#gallery-main");
  const media = $(".gallery-media");
  if (!main || !media) return;
  document.querySelectorAll(".thumb").forEach((t) => {
    t.addEventListener("click", () => {
      main.src = t.dataset.src;
      media.dataset.full = t.dataset.full;
      document.querySelectorAll(".thumb").forEach((x) => x.classList.toggle("is-active", x === t));
    });
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
  const setText = (sel, v) => { const el = $(sel); if (el) el.textContent = v; };
  setText("#year", new Date().getFullYear());
  setText("#phone-label", CONTATTI.whatsappLabel);
  setText("#email-label", CONTATTI.email);
  setText("#instagram-label", CONTATTI.instagramLabel);
  setText("#footer-phone", CONTATTI.whatsappLabel);
  setText("#footer-email", CONTATTI.email);

  document.querySelectorAll("[data-social]").forEach((a) => {
    const k = a.dataset.social;
    if (k === "whatsapp") a.href = waLink("Ciao Grazie al Cactus! Avrei una domanda.");
    else if (k === "email") a.href = `mailto:${CONTATTI.email}`;
    else if (CONTATTI[k]) a.href = CONTATTI[k];
  });

  bindLightbox();
  initThumbs();
  initCart();
  if ($("#custom-form")) initCustomForm();
  initNav();
  initLightbox();

  // Se il link arriva con #p-nome, evidenzia il pezzo
  if (location.hash.startsWith("#p-")) {
    const el = document.getElementById(location.hash.slice(1));
    if (el) { el.classList.add("is-linked"); el.scrollIntoView({ block: "center" }); }
  }
});
