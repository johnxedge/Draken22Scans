# Diagnóstico del formulario de solicitudes

## Cambios realizados en esta versión

- El formulario ya no depende de una función de Supabase que no se desplegaba al subir archivos a GitHub.
- La solicitud llama a una función de Netlify: `netlify/functions/request-manga.js`.
- La descripción y el correo de contacto son opcionales; solo se exige el nombre del manga y una imagen.
- La imagen se reduce en el navegador antes de enviarla para reducir el tamaño de la petición.
- Los errores de la función se muestran en el formulario en lugar de quedarse ocultos.

## Configuración externa obligatoria

En Netlify configura `RESEND_API_KEY`, `ADMIN_EMAIL` y `FROM_EMAIL`. La dirección remitente debe estar autorizada en Resend. Después vuelve a desplegar el sitio.

## Cómo probarlo

1. Abre la web publicada y envía una solicitud con nombre e imagen.
2. Si aparece un error de configuración, revisa las variables de entorno de Netlify.
3. Si Resend rechaza el envío, revisa que el remitente esté verificado y consulta el historial de envíos de Resend.
4. Revisa también Spam.

No se debe incluir la clave privada de Resend en el repositorio. La función muestra mensajes generales al visitante y escribe los detalles técnicos en los registros de Netlify.
