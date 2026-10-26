/* DRAKEN22 SCANS — LÓGICA DE LA PÁGINA
   Este archivo lee window.MANGAS (definido en catalogo.js) y genera tarjetas,
   actualiza estadísticas y aplica filtros/búsquedas. Para editar títulos,
   autores, capítulos o volúmenes, modifica catalogo.js en lugar de este archivo.
   Los botones de plataformas se editan en index.html y se diseñan en styles.css.
*/
// Versión estática: el catálogo se lee desde catalogo.js y no necesita Supabase ni SQL.
// Atajos para buscar un elemento del HTML por su selector CSS.
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
// Estado temporal de la página: mangas cargados, filtro activo y búsqueda.
const state = { mangas: [], filter: 'todos', query: '' };
// Escapa caracteres especiales para que los textos del catálogo no se interpreten como HTML.
const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Convierte distintas formas de escribir el estado a valores consistentes.
const normalizeStatus = status => {
  const value = String(status || '').trim().toLocaleLowerCase('es');
  if (['completo', 'completos', 'complete', 'finished', 'finalizado', 'finalizados'].includes(value)) return 'completo';
  if (['pausado', 'pausa', 'en pausa'].includes(value)) return 'pausado';
  return 'produccion';
};
const statusLabel = status => status === 'completo' ? 'Completo' : status === 'pausado' ? 'En pausa' : 'En producción';

// Normaliza la ruta de la portada para usarla como dirección local segura.
function coverSrc(value = '') {
  const path = String(value || '').trim().replace(/\\/g, '/').replace(/^\.\//, '');
  if (!path || /^(https?:|data:|blob:|file:)/i.test(path) || /^[a-z]:\//i.test(path) || path.startsWith('/')) return '';
  return path.split('/').map(part => {
    try { return encodeURIComponent(decodeURIComponent(part)); }
    catch { return encodeURIComponent(part); }
  }).join('/');
}
// Crea la etiqueta de imagen de una portada con texto alternativo.
function coverImageTag(value, title, className = '') {
  const src = coverSrc(value);
  return src
    ? `<img${className ? ` class="${esc(className)}"` : ''} src="${esc(src)}" alt="${esc(title || '')}" loading="lazy" onerror="this.hidden=true;this.insertAdjacentHTML('afterend','<span class=&quot;muted&quot;>Portada no encontrada</span>')">`
    : `<div class="cover-missing ${esc(className)}" role="img" aria-label="Portada no encontrada">Portada no encontrada</div>`;
}

const PLATFORM_MANGAS = [];

// Completa y normaliza los datos de una ficha del catálogo.
function normalizeManga(manga, index) {
  return {
    id: manga.id ?? `manga-${index + 1}`,
    title: String(manga.title || 'Manga sin título'),
    autor: String(manga.autor || 'No especificado'),
    tipo: ['doujinshi', 'fanmanga'].includes(String(manga.tipo || '').trim().toLocaleLowerCase('es')) ? 'Doujinshi' : 'Manga',
    image_url: manga.image_url || manga.imagen || manga.cover || '',
    status: normalizeStatus(manga.status),
    formato: manga.formato === 'volumenes' ? 'volumenes' : 'capitulos',
    chapter: Number(manga.chapter) || 0,
    total: manga.total == null || manga.total === '' ? null : Number(manga.total),
    totalVolumenes: Number(manga.totalVolumenes) || 0,
    volumenesDisponibles: Number(manga.volumenesDisponibles) || 0,
    traduccionCompleta: manga.traduccionCompleta === true,
    description: manga.description || '',
    links: Array.isArray(manga.links) ? manga.links : []
  };
}
// Dibuja la sección de últimos mangas.
function renderUpdates() {
  const list = $('#updates-list');
  if (!list) return;
  if (!state.mangas.length) { list.innerHTML = '<p class="muted">Añade mangas en catalogo.js para mostrar las últimas novedades.</p>'; return; }
  list.innerHTML = state.mangas.slice(0, 6).map(m => {
    const meta = m.formato === 'volumenes' ? `Volúmenes: ${m.volumenesDisponibles} / ${m.totalVolumenes || '?'}` : `Capítulos: ${m.chapter}${m.total ? ` / ${m.total}` : ''}`;
    return `<article class="update-row">${coverImageTag(m.image_url, m.title)}<div style="min-width:0"><p class="update-title">${esc(m.title)}</p><p class="update-meta">${meta}</p><span class="mini-tag ${m.status === 'completo' ? 'mini-done' : 'mini-prod'}">${m.traduccionCompleta ? 'Traducción completa' : statusLabel(m.status)}</span></div></article>`;
  }).join('');
}
// Calcula y muestra los contadores del sitio.
function renderStats() {
  if ($('#count-all')) $('#count-all').textContent = state.mangas.length;
  if ($('#count-prod')) $('#count-prod').textContent = state.mangas.filter(m => m.status === 'produccion').length;
  if ($('#count-done')) $('#count-done').textContent = state.mangas.filter(m => m.status === 'completo').length;
}
// Dibuja las tarjetas principales y aplica búsqueda/filtros.
function renderCatalog() {
  const grid = $('#catalog-grid');
  if (!grid) return;
  const q = state.query.trim().toLocaleLowerCase();
  const shown = state.mangas.filter(m => (state.filter === 'todos' || m.status === state.filter) && m.title.toLocaleLowerCase().includes(q));
  if (!shown.length) { grid.innerHTML = '<div class="panel empty-state">No hay mangas que coincidan. Añade títulos en catalogo.js.</div>'; return; }
  grid.innerHTML = shown.map((m, i) => {
    const isVolumes = m.formato === 'volumenes';
    const current = isVolumes ? m.volumenesDisponibles : m.chapter;
    const total = isVolumes ? m.totalVolumenes : (Number(m.total) || 0);
    // Mostrar capítulos y volúmenes por separado cuando existan ambos datos.
    // Así Dragon Ball Kakumei puede indicar 30 capítulos y 5 volúmenes.
    const chapterLabel = `Capítulos: ${m.chapter}${m.total ? ` / ${m.total}` : ''}`;
    const volumeLabel = m.totalVolumenes > 0
      ? `Volúmenes: ${m.volumenesDisponibles} / ${m.totalVolumenes}`
      : '';
    const progressLabel = isVolumes ? volumeLabel : chapterLabel;
    const progressPct = total > 0 ? Math.min(100, current / total * 100) : 0;
    const translationLabel = m.traduccionCompleta ? 'Traducción completa' : (m.status === 'completo' ? 'Completo' : 'Traducción en curso');
    return `<article class="manga-card" style="animation-delay:${i * 60}ms"><div class="manga-image-wrap">${coverImageTag(m.image_url, `Portada de ${m.title}`, 'manga-img')}<span class="badge ${m.status === 'completo' ? 'badge-done' : 'badge-prod'}">${m.status === 'completo' ? '✔ Completo' : m.status === 'pausado' ? 'Ⅱ En pausa' : '● En producción'}</span><span class="type-badge">${esc(m.tipo)}</span><span class="chapter-num">${isVolumes ? `Vol. ${current}` : `Cap. ${current}`}</span></div><div class="manga-info"><h3 class="manga-title">${esc(m.title)}</h3><p class="manga-meta"><strong>Autor:</strong> ${esc(m.autor)}</p><p class="manga-meta">${esc(chapterLabel)}</p>${volumeLabel ? `<p class="manga-meta">${esc(volumeLabel)}</p>` : ''}<p class="manga-meta">${esc(translationLabel)}</p>${total > 0 ? `<div class="progress"><div class="progress-bar" style="width:${progressPct}%"></div></div>` : ''}</div></article>`;
  }).join('');
}
// Reserva/gestiona la zona de mangas de otras plataformas si está habilitada.
function renderPlatformMangas() {
  const list = $('#platform-manga-list');
  if (!list) return;
  const entries = PLATFORM_MANGAS.filter(item => item.links?.some(link => /^https?:\/\//i.test(String(link.url || ''))));
  if (!entries.length) { list.innerHTML = '<p class="muted">Todavía no hay mangas externos configurados.</p>'; return; }
  list.innerHTML = entries.map(item => {
    const links = item.links.filter(link => /^https?:\/\//i.test(String(link.url || ''))).map(link => `<a class="btn-read" href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">${esc(link.label || 'Abrir plataforma')}</a>`).join('');
    return `<article class="platform-card"><div class="platform-card-info"><h3>${esc(item.title)}</h3><p class="muted">${esc(item.description || 'Disponible en otras plataformas.')}</p><div class="links-container">${links}</div></div></article>`;
  }).join('');
}
// Actualiza de una vez todas las zonas dinámicas de la página.
function renderAll() { renderUpdates(); renderStats(); renderCatalog(); renderPlatformMangas(); }

// Muestra una ventana modal con el contenido HTML indicado.
function openModal(markup) {
  const root = $('#modal-root');
  if (!root) return;
  root.innerHTML = `<div class="modal-backdrop"><section class="modal-panel" role="dialog" aria-modal="true">${markup}</section></div>`;
  $('.modal-backdrop', root)?.addEventListener('click', e => { if (e.target.classList.contains('modal-backdrop')) root.innerHTML = ''; });
  document.addEventListener('keydown', function closeOnEscape(e) { if (e.key === 'Escape') { root.innerHTML = ''; document.removeEventListener('keydown', closeOnEscape); } });
}
// Convierte un archivo seleccionado en una URL de datos cuando el formulario lo necesita.
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const max = 600, scale = Math.min(1, max / image.width), canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', .8));
      };
      image.onerror = reject; image.src = reader.result;
    };
    reader.onerror = reject; reader.readAsDataURL(file);
  });
}
// Prepara el formulario para enviar una solicitud desde la web.
function openRequestForm() {
  openModal(`<div id="request-content"><form id="request-form" class="form-stack"><h2>Solicitar un manga</h2><p class="muted">Cuéntanos qué manga de Dragon Ball te gustaría ver traducido al español.</p><label><span class="field-label">Nombre del manga</span><input id="request-manga" class="field" placeholder="Nombre del manga" required maxlength="150"></label><label><span class="field-label">Imagen de referencia</span><input id="request-image" class="field" type="file" accept="image/jpeg,image/png,image/webp" required><small class="muted">JPG, PNG o WebP. Se adjuntará al correo de solicitud.</small></label><label><span class="field-label">Descripción breve</span><textarea id="request-note" class="field" rows="3" placeholder="Información adicional (opcional)" maxlength="700"></textarea></label><label><span class="field-label">Tu correo (opcional)</span><input id="request-contact" type="email" class="field" placeholder="Para poder responderte" maxlength="160"></label><p id="request-error" class="error-text"></p><button class="btn-slash full" type="submit">Enviar solicitud</button></form></div>`);
  $('#request-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.currentTarget, btn = $('button[type="submit"]', form), errorBox = $('#request-error');
    const imageFile = $('#request-image').files?.[0];
    const manga = $('#request-manga').value.trim().slice(0, 150);
    const description = $('#request-note').value.trim().slice(0, 700) || 'Sin descripción adicional.';
    const contact = $('#request-contact').value.trim().slice(0, 160);
    if (!imageFile) { errorBox.textContent = 'Adjunta una imagen de referencia.'; return; }
    if (imageFile.size > 8 * 1024 * 1024) { errorBox.textContent = 'La imagen debe pesar menos de 8 MB.'; return; }
    btn.disabled = true; btn.textContent = 'Enviando…'; errorBox.textContent = '';
    try {
      const imageDataUrl = await fileToDataUrl(imageFile);
      const response = await fetch('/.netlify/functions/request-manga', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ manga, description, contact, imageDataUrl, imageName: (imageFile.name.replace(/\.[^.]+$/, '') || 'referencia') + '.jpg' }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.error || 'No se pudo enviar. Esta función requiere publicar la página en Netlify y configurar el correo.');
      $('#request-content').innerHTML = '<div style="text-align:center"><h2 class="success-title">¡Solicitud enviada!</h2><p class="muted">Recibimos tu solicitud. Gracias por ayudarnos a elegir la próxima traducción.</p><button id="close-request" class="btn-slash">Cerrar</button></div>';
      $('#close-request')?.addEventListener('click', () => { $('#modal-root').innerHTML = ''; });
    } catch (err) {
      errorBox.textContent = err.message || 'No se pudo enviar la solicitud. Comprueba tu conexión e inténtalo de nuevo.';
      btn.disabled = false; btn.textContent = 'Enviar solicitud';
    }
  });
}

// Búsqueda desde la barra superior y la búsqueda del encabezado.
$('#search')?.addEventListener('input', e => { state.query = e.target.value; renderCatalog(); });
$('#hero-search')?.addEventListener('input', e => { state.query = e.target.value; if ($('#search')) $('#search').value = e.target.value; renderCatalog(); });
$('#hero-search-button')?.addEventListener('click', () => { state.query = $('#hero-search')?.value || ''; if ($('#search')) $('#search').value = state.query; renderCatalog(); $('#catalogo')?.scrollIntoView({ behavior: 'smooth' }); });
$$('[data-filter]').forEach(btn => btn.addEventListener('click', () => {
  state.filter = btn.dataset.filter;
  $$('[data-filter]').forEach(other => {
    const active = other.dataset.filter === state.filter;
    other.classList.toggle('tab-active', active);
    other.classList.toggle('pill-active', active);
  });
  renderCatalog();
}));
$('#open-request')?.addEventListener('click', openRequestForm);
$('#open-request-side')?.addEventListener('click', openRequestForm);
// El catálogo es estático: no se muestran controles de administración que dependían de Supabase.
$('#add-manga')?.classList.add('hidden');
$('#sign-out')?.classList.add('hidden');

try {
  state.mangas = Array.isArray(window.MANGAS) ? window.MANGAS.map(normalizeManga) : [];
  renderAll();
} catch (error) {
  console.error('No se pudo cargar catalogo.js:', error);
  const message = '<p class="empty-state">No se pudo leer catalogo.js. Revisa la sintaxis del archivo.</p>';
  if ($('#catalog-grid')) $('#catalog-grid').innerHTML = message;
  if ($('#updates-list')) $('#updates-list').innerHTML = message;
  renderPlatformMangas();
}
