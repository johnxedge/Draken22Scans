DRAKEN22 SCANS — VERSIÓN CON CATÁLOGO EDITABLE Y FUNCIÓN DE NETLIFY

ARCHIVOS CLAVE
- index.html: página principal.
- styles.css: diseño.
- app.js: búsqueda, filtros, tarjetas y formulario.
- catalogo.js: catálogo de mangas y enlaces de capítulos.
- portadas/: portadas de mangas.
- administrar.html: guía de administración dentro del sitio.
- netlify/functions/request-manga.js: función de envío de solicitudes.
- netlify.toml: configura Netlify para publicar el sitio y sus funciones.

AÑADIR MANGAS
1. Sube la portada a portadas/ en GitHub.
2. Edita catalogo.js y copia el ejemplo comentado.
3. Guarda los cambios en GitHub y espera el despliegue de Netlify.

CORREO
Configura RESEND_API_KEY, ADMIN_EMAIL y FROM_EMAIL en las variables de entorno de Netlify. El correo no funcionará hasta que estas variables y el remitente de Resend estén configurados correctamente.

No se necesita Supabase ni SQL para esta versión del catálogo. Lee ADMINISTRACION.md y DIAGNOSTICO_FORMULARIO.md para más información.
