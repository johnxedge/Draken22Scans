import { MANGAS } from "./catalogo.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const state = { mangas: Array.isArray(MANGAS) ? MANGAS : [], filter: "todos", query: "" };
const esc = (value = "") => String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
const statusLabel = status => status === "completo" ? "Completo" : "En producción";

function renderAll() { renderUpdates(); renderStats(); renderCatalog(); }
function renderUpdates() {
  const list = $("#updates-list");
  if (!state.mangas.length) { list.innerHTML = '<p class="muted">Pronto habrá mangas nuevos. El catálogo se configura en <code>catalogo.js</code>.</p>'; return; }
  list.innerHTML = state.mangas.slice(0, 6).map(m => `
    <article class="update-row">
      <img src="${esc(m.image_url || "assets/logo-draken22.png")}" alt="Portada de ${esc(m.title)}" loading="lazy">
      <div style="min-width:0"><p class="update-title">${esc(m.title)}</p>
      <p class="update-meta">Cap. ${Number(m.chapter) || 0}${Number(m.pages) > 0 ? ` · ${Number(m.pages)} páginas` : ""}</p>
      <span class="mini-tag ${m.status === "completo" ? "mini-done" : "mini-prod"}">${statusLabel(m.status)}</span></div>
    </article>`).join("");
}
function renderStats() {
  $("#count-all").textContent = state.mangas.length;
  $("#count-prod").textContent = state.mangas.filter(m => m.status !== "completo").length;
  $("#count-done").textContent = state.mangas.filter(m => m.status === "completo").length;
}
function renderCatalog() {
  const grid = $("#catalog-grid");
  if (!grid) return;
  const q = state.query.trim().toLocaleLowerCase();
  const shown = state.mangas.filter(m => (state.filter === "todos" || (m.status || "produccion") === state.filter) && String(m.title || "").toLocaleLowerCase().includes(q));
  if (!shown.length) {
    grid.innerHTML = state.mangas.length
      ? '<div class="panel empty-state">No hay mangas que coincidan con la búsqueda.</div>'
      : '<div class="panel empty-state">El catálogo todavía está vacío. Para agregar mangas, abre <code>catalogo.js</code> y sigue las instrucciones de <a href="administrar.html">Administración</a>.</div>';
    return;
  }
  grid.innerHTML = shown.map((m, i) => {
    const chapter = Number(m.chapter) || 0, total = Number(m.total) || 0, pages = Number(m.pages) || 0;
    const links = Array.isArray(m.links) ? m.links : [];
    return `<article class="manga-card" data-details="${esc(m.id || m.title)}" tabindex="0" role="button" aria-label="Ver detalles de ${esc(m.title)}" style="animation-delay:${i * 60}ms">
      <div class="manga-image-wrap"><img class="manga-img" src="${esc(m.image_url || "assets/logo-draken22.png")}" alt="Portada de ${esc(m.title)}" loading="lazy" onerror="this.onerror=null;this.src='assets/logo-draken22.png'">
      <span class="badge ${m.status === "completo" ? "badge-done" : "badge-prod"}">${m.status === "completo" ? "✔ Completo" : "● En producción"}</span></div>
      <div class="manga-info"><h3 class="manga-title">${esc(m.title)}</h3>
      <p class="manga-description">${esc(m.description || "Descripción próximamente.")}</p>
      <div class="manga-details"><span>Estado: <strong>${statusLabel(m.status)}</strong></span><span>Capítulos: <strong>${chapter}${total ? ` / ${total}` : ""}</strong></span><span>Páginas: <strong>${pages || "Por confirmar"}</strong></span></div>
      ${total ? `<div class="progress" aria-label="Progreso de capítulos"><div class="progress-bar" style="width:${Math.min(100, chapter / total * 100)}%"></div></div>` : ""}
      <p class="muted">${links.length ? `${links.length} enlace(s) disponible(s) · Ver detalles` : "Ver detalles"}</p></div></article>`;
  }).join("");
  $$("[data-details]", grid).forEach(card => {
    const open = () => {
      const manga = shown.find(m => String(m.id || m.title) === card.dataset.details);
      if (manga) openMangaDetails(manga);
    };
    card.addEventListener("click", open);
    card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
  });
}
function openModal(markup) {
  const root = $("#modal-root");
  root.innerHTML = `<div class="modal-backdrop"><section class="modal-panel" role="dialog" aria-modal="true">${markup}</section></div>`;
  $(".modal-backdrop", root).addEventListener("click", e => { if (e.target.classList.contains("modal-backdrop")) closeModal(); });
  document.addEventListener("keydown", escModal, { once: true });
}
function escModal(e) { if (e.key === "Escape") closeModal(); }
function closeModal() { $("#modal-root").innerHTML = ""; }
function openMangaDetails(manga) {
  const links = Array.isArray(manga.links) ? manga.links : [];
  const linksMarkup = links.length ? `<div class="form-stack"><h3>Enlaces de lectura / descarga</h3>${links.map((link, i) => {
    const url = String(link.url || "");
    if (!/^https?:\/\//i.test(url)) return "";
    return `<a class="btn-yellow full" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(link.label || `Capítulo ${link.chapter || i + 1}`)}</a>`;
  }).join("")}</div>` : '<p class="muted">Todavía no hay enlaces publicados para este manga.</p>';
  openModal(`<div class="form-stack"><h2>${esc(manga.title)}</h2><img src="${esc(manga.image_url || "assets/logo-draken22.png")}" alt="Portada de ${esc(manga.title)}" style="display:block;max-width:220px;max-height:300px;object-fit:contain;margin:auto"><p>${esc(manga.description || "Descripción próximamente.")}</p><p><strong>Estado:</strong> ${statusLabel(manga.status)} · <strong>Capítulo:</strong> ${Number(manga.chapter) || 0}</p>${linksMarkup}<button id="close-details" class="btn-slash" type="button">Cerrar</button></div>`);
  $("#close-details").addEventListener("click", closeModal);
}
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const max = 700, scale = Math.min(1, max / image.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("No se pudo procesar la imagen."));
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      image.onerror = () => reject(new Error("El archivo no parece ser una imagen válida."));
      image.src = reader.result;
    };
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}
function openRequestForm() {
  openModal(`<div id="request-content"><form id="request-form" class="form-stack"><h2>Solicitar un manga</h2><p class="muted">Cuéntanos qué manga de Dragon Ball te gustaría ver traducido al español.</p>
    <label><span class="field-label">Nombre del manga</span><input id="request-manga" class="field" placeholder="Nombre del manga" required minlength="2" maxlength="150"></label>
    <label><span class="field-label">Imagen de referencia</span><input id="request-image" class="field" type="file" accept="image/jpeg,image/png,image/webp" required><small class="muted">JPG, PNG o WebP. La imagen se reducirá antes de enviarla.</small></label>
    <label><span class="field-label">Descripción breve</span><textarea id="request-note" class="field" rows="3" placeholder="Información adicional (opcional)" maxlength="700"></textarea></label>
    <label><span class="field-label">Tu correo (opcional)</span><input id="request-contact" type="email" class="field" placeholder="Para poder responderte" maxlength="160"></label>
    <p id="request-error" class="error-text" aria-live="polite"></p><button class="btn-slash full" type="submit">Enviar solicitud</button></form></div>`);
  $("#request-form").addEventListener("submit", async e => {
    e.preventDefault();
    const form = e.currentTarget, btn = $('button[type="submit"]', form), errorBox = $("#request-error");
    const imageFile = $("#request-image").files?.[0];
    const manga = $("#request-manga").value.trim().slice(0, 150);
    const description = $("#request-note").value.trim().slice(0, 700);
    const contact = $("#request-contact").value.trim().slice(0, 160);
    if (manga.length < 2) { errorBox.textContent = "Escribe el nombre del manga (mínimo 2 caracteres)."; return; }
    if (!imageFile) { errorBox.textContent = "Adjunta una imagen de referencia."; return; }
    if (imageFile.size > 8 * 1024 * 1024) { errorBox.textContent = "La imagen original debe pesar menos de 8 MB."; return; }
    btn.disabled = true; btn.textContent = "Enviando…"; errorBox.textContent = "";
    try {
      const imageDataUrl = await fileToDataUrl(imageFile);
      const response = await fetch("/.netlify/functions/request-manga", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manga, description, contact, imageDataUrl, imageName: (imageFile.name.replace(/\.[^.]+$/, "") || "referencia") + ".jpg" })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.error || `Error HTTP ${response.status}`);
      $("#request-content").innerHTML = '<div style="text-align:center"><h2 class="success-title">¡Solicitud enviada!</h2><p class="muted">Recibimos tu solicitud. Gracias por ayudarnos a elegir la próxima traducción.</p><button id="close-request" class="btn-slash" type="button">Cerrar</button></div>';
      $("#close-request").addEventListener("click", closeModal);
    } catch (err) {
      console.error("Error enviando solicitud:", err);
      errorBox.textContent = err.message || "No se pudo enviar. Comprueba la conexión e inténtalo de nuevo.";
      btn.disabled = false; btn.textContent = "Enviar solicitud";
    }
  });
}

$("#search")?.addEventListener("input", e => { state.query = e.target.value; if ($("#hero-search")) $("#hero-search").value = e.target.value; renderCatalog(); });
$("#hero-search")?.addEventListener("input", e => { state.query = e.target.value; if ($("#search")) $("#search").value = e.target.value; renderCatalog(); });
$("#hero-search-button")?.addEventListener("click", () => { renderCatalog(); $("#catalogo")?.scrollIntoView({ behavior: "smooth" }); });
$("#hero-search")?.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); $("#hero-search-button")?.click(); } });
$$("[data-filter]").forEach(btn => btn.addEventListener("click", () => {
  state.filter = btn.dataset.filter;
  $$("[data-filter]").forEach(b => { b.classList.toggle("tab-active", b === btn); b.classList.toggle("pill-active", b === btn); });
  renderCatalog();
}));
["open-request", "open-request-side", "open-request-stat"].forEach(id => $(`#${id}`)?.addEventListener("click", openRequestForm));
$("#team-link")?.addEventListener("click", () => { window.location.href = "administrar.html"; });
renderAll();
