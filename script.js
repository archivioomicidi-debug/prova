/* ==========================================================
   Grazie al Cactus · logica di pagina
   Modifica i contatti qui sotto: sono usati da tutti i pulsanti.
   ========================================================== */

const CONTATTI = {
  // Numero WhatsApp in formato internazionale, senza + né spazi. Es: "393331234567"
  whatsapp: "39XXXXXXXXXX",
  email: "info@grazie-al-cactus.it",
  instagram: "https://www.instagram.com/grazie_al_cactus",
  facebook: "https://www.facebook.com/grazie.al.cactus",
};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  // Link social
  document.querySelectorAll("[data-social]").forEach((a) => {
    const url = CONTATTI[a.dataset.social];
    if (url) a.href = url;
  });

  // "Chiedi info" preseleziona il prodotto nel modulo
  const productSelect = document.getElementById("product");
  document.querySelectorAll("[data-product]").forEach((a) => {
    a.addEventListener("click", () => {
      productSelect.value = a.dataset.product;
    });
  });

  // Modulo: apre WhatsApp o il client email con il testo precompilato
  const form = document.getElementById("contact-form");
  const buildMessage = () => {
    const product = productSelect.value;
    const msg = document.getElementById("message").value.trim();
    let text = "Ciao Grazie al Cactus! ";
    if (product) text += `Mi interessa "${product}". `;
    text += msg || "Vorrei sapere disponibilità e prezzo.";
    return text;
  };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = encodeURIComponent(buildMessage());
    window.open(`https://wa.me/${CONTATTI.whatsapp}?text=${text}`, "_blank", "noopener");
  });
  form.querySelector('[data-channel="email"]').addEventListener("click", () => {
    const subject = encodeURIComponent("Richiesta da grazie-al-cactus");
    const body = encodeURIComponent(buildMessage());
    window.location.href = `mailto:${CONTATTI.email}?subject=${subject}&body=${body}`;
  });

  // Lightbox
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const closeLightbox = () => {
    lightbox.hidden = true;
    lightboxImg.src = "";
    document.body.style.overflow = "";
  };
  document.querySelectorAll(".card-media").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".card");
      lightboxImg.src = btn.dataset.full;
      lightboxImg.alt = btn.querySelector("img").alt;
      lightboxCaption.textContent = card.dataset.name || "";
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
    });
  });
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.classList.contains("lightbox-close")) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
  });
});
