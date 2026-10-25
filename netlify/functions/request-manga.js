const corsHeaders = {
  "Content-Type": "application/json; charset=utf-8",
};

function json(statusCode, body) {
  return { statusCode, headers: corsHeaders, body: JSON.stringify(body) };
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: { ...corsHeaders, "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" }, body: "" };
  }
  if (event.httpMethod !== "POST") return json(405, { error: "Método no permitido." });

  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  const fromEmail = process.env.FROM_EMAIL;
  if (!apiKey || !adminEmail || !fromEmail) {
    console.error("Faltan variables RESEND_API_KEY, ADMIN_EMAIL o FROM_EMAIL en Netlify.");
    return json(500, { error: "El servicio de correo todavía no está configurado. Contacta al administrador." });
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const manga = typeof body.manga === "string" ? body.manga.trim().slice(0, 150) : "";
    const description = typeof body.description === "string" ? body.description.trim().slice(0, 700) : "";
    const contact = typeof body.contact === "string" ? body.contact.trim().slice(0, 160) : "";
    const imageDataUrl = typeof body.imageDataUrl === "string" ? body.imageDataUrl : "";
    const imageName = typeof body.imageName === "string" ? body.imageName.replace(/[^\w.\- ]/g, "_").slice(0, 100) : "referencia.jpg";

    if (manga.length < 2) return json(400, { error: "Escribe un nombre de manga de al menos 2 caracteres." });
    if (!imageDataUrl) return json(400, { error: "Adjunta una imagen de referencia." });
    if (imageDataUrl.length > 5_500_000) return json(413, { error: "La imagen es demasiado grande. Prueba con una imagen más pequeña." });
    const match = imageDataUrl.match(/^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]+)$/i);
    if (!match) return json(400, { error: "El archivo debe ser una imagen JPG, PNG o WebP." });

    const imageType = match[1].toLowerCase() === "jpg" ? "jpeg" : match[1].toLowerCase();
    const imageBase64 = match[2];
    const html = `<div style="font-family:Arial,sans-serif;color:#222;line-height:1.5">
      <h2>Nueva solicitud de manga — Draken22 Scans</h2>
      <p><strong>Manga solicitado:</strong> ${escapeHtml(manga)}</p>
      <p><strong>Descripción:</strong><br>${description ? escapeHtml(description).replace(/\n/g, "<br>") : "Sin descripción adicional."}</p>
      <p><strong>Correo de contacto:</strong> ${contact ? escapeHtml(contact) : "No proporcionado"}</p>
      <p>La imagen de referencia viene adjunta a este correo.</p></div>`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromEmail,
        to: [adminEmail],
        subject: `Draken22 Scans — Solicitud: ${manga}`,
        html,
        attachments: [{ filename: imageName || `referencia.${imageType}`, content: imageBase64 }],
        ...(contact && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) ? { reply_to: contact } : {})
      })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("Resend error:", response.status, result);
      return json(502, { error: "Resend no pudo enviar el correo. Revisa la configuración del remitente en Netlify y Resend." });
    }
    return json(200, { ok: true });
  } catch (error) {
    console.error("Error procesando solicitud:", error);
    return json(400, { error: "No se pudo procesar la solicitud. Comprueba los datos e inténtalo de nuevo." });
  }
};
