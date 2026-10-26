# Draken22 Scans — guía de administración

Esta versión usa archivos estáticos para el catálogo y funciones de Netlify para el formulario. **No usa Supabase ni SQL para administrar el catálogo.**

## Dónde cambiar cada cosa

| Quiero cambiar… | Archivo o carpeta |
|---|---|
| Añadir/editar mangas, descripción, estado y números de capítulos | `catalogo.js` |
| Guardar portadas | `portadas/` |
| Añadir enlaces de lectura/descarga por capítulo | `catalogo.js`, propiedad `links` |
| Textos y estructura de la página | `index.html` |
| Colores y diseño adaptable | `styles.css` |
| Buscador, filtros, tarjetas y formulario | `app.js` |
| Configuración de publicación y carpeta de funciones | `netlify.toml` |
| Guía visual para administrar el sitio | `administrar.html` |

## Añadir un manga

1. Sube su portada a `portadas/` en GitHub.
2. Abre `catalogo.js`, edítalo y copia el bloque de ejemplo.
3. Cambia `id`, `title`, `image_url`, `description`, `status`, `chapter`, `total`, `pages` y `links`.
4. Usa `status: "produccion"` o `status: "completo"`.
5. Guarda los cambios en GitHub. Netlify publica el sitio cuando termina el despliegue.

Ejemplo de enlaces:
```js
links: [
  { chapter: 1, label: "Leer capítulo 1", url: "https://tu-enlace-de-lectura" },
  { chapter: 1, label: "Descargar capítulo 1", url: "https://tu-enlace-de-descarga" }
]
```
Pon solo enlaces reales que quieras compartir públicamente. Al pulsar una tarjeta del catálogo, el visitante verá los enlaces disponibles.



- `RESEND_API_KEY`: clave privada de Resend.
- `ADMIN_EMAIL`: correo donde recibirás solicitudes.
- `FROM_EMAIL`: remitente permitido/verificado en Resend.

No coloques la clave privada en `app.js`, `catalogo.js`, HTML ni en GitHub. Después de configurar variables, vuelve a desplegar el sitio. El ZIP no puede incluir tus claves ni configurar tu cuenta por ti.

## Pruebas y límites

- Se puede probar el catálogo sin una cuenta ni base de datos.
- El correo no puede confirmarse sin variables válidas de Netlify/Resend y un despliegue real.
- Las portadas y los enlaces del catálogo son públicos porque forman parte del sitio.


NOTA DE DOCUMENTACIÓN: consulta GUIA_PARA_EDITAR.txt para localizar qué archivo cambiar según el ajuste que quieras realizar.
