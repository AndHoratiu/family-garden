import { Resend } from "resend";

let resend = null;

function getClient() {
  if (resend) return resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  resend = new Resend(key);
  return resend;
}

const formatRON = (n) => `${Number(n || 0).toFixed(2)} lei`;

function buildOrderHtml(order) {
  const items = (order.items || [])
    .map(
      (it) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e3ebde;font-size:14px;">
        <strong>${it.quantity} ×</strong> ${it.name}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #e3ebde;font-size:14px;text-align:right;">
        ${formatRON(it.price)} <span style="color:#5b7a5f;">/ ${(it.unit || "").split(" / ")[1] || "buc"}</span>
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #e3ebde;font-size:14px;text-align:right;font-weight:600;">
        ${formatRON(it.price * it.quantity)}
      </td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Comandă nouă #${order.orderNumber}</title>
</head>
<body style="margin:0;padding:0;background:#f8f5ed;font-family:Arial,Helvetica,sans-serif;color:#1f4023;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f5ed;padding:30px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#2f6a36,#4f8f43);padding:30px;color:white;">
            <h1 style="margin:0;font-size:24px;">🌱 Comandă nouă Family Garden</h1>
            <p style="margin:8px 0 0;opacity:0.9;font-size:14px;">Comanda <strong>#${order.orderNumber}</strong> · ${new Date(order.createdAt).toLocaleString("ro-RO")}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 30px;">
            <h2 style="margin:0 0 12px;font-size:18px;color:#1f4023;">Detalii client</h2>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;line-height:1.6;">
              <tr><td style="padding:4px 0;"><strong>Nume:</strong></td><td>${order.customerName || "-"}</td></tr>
              <tr><td style="padding:4px 0;"><strong>Telefon:</strong></td><td><a href="tel:${order.customerPhone}" style="color:#2f6a36;text-decoration:none;">${order.customerPhone || "-"}</a></td></tr>
              <tr><td style="padding:4px 0;"><strong>Email:</strong></td><td>${order.customerEmail ? `<a href="mailto:${order.customerEmail}" style="color:#2f6a36;text-decoration:none;">${order.customerEmail}</a>` : "-"}</td></tr>
              <tr><td style="padding:4px 0;vertical-align:top;"><strong>Adresă:</strong></td><td>${order.customerAddress || "-"}</td></tr>
              <tr><td style="padding:4px 0;"><strong>Livrare:</strong></td><td>${order.deliveryMethod}</td></tr>
              <tr><td style="padding:4px 0;"><strong>Plată:</strong></td><td>${order.paymentMethod}</td></tr>
              ${order.notes ? `<tr><td style="padding:4px 0;vertical-align:top;"><strong>Observații:</strong></td><td style="background:#f8faf6;padding:8px 10px;border-radius:8px;">${order.notes}</td></tr>` : ""}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 30px 24px;">
            <h2 style="margin:24px 0 12px;font-size:18px;color:#1f4023;">Produse comandate</h2>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e3ebde;border-radius:12px;overflow:hidden;">
              ${items}
              <tr>
                <td colspan="2" style="padding:10px 12px;font-size:14px;background:#f8faf6;color:#516454;">Subtotal</td>
                <td style="padding:10px 12px;font-size:14px;text-align:right;background:#f8faf6;font-weight:600;">${formatRON(order.subtotal)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding:10px 12px;font-size:14px;background:#f8faf6;color:#516454;">Livrare</td>
                <td style="padding:10px 12px;font-size:14px;text-align:right;background:#f8faf6;font-weight:600;">${formatRON(order.deliveryFee)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding:14px 12px;font-size:16px;background:#eef3ea;color:#1f4023;font-weight:700;">TOTAL</td>
                <td style="padding:14px 12px;font-size:18px;text-align:right;background:#eef3ea;color:#2f6a36;font-weight:800;">${formatRON(order.total)}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 30px;background:#f8faf6;text-align:center;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || ""}/admin" style="display:inline-block;background:#4f8f43;color:white;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:600;font-size:14px;">
              Deschide panoul Admin →
            </a>
            <p style="margin:14px 0 0;color:#5b7a5f;font-size:12px;">Sună clientul pentru a confirma comanda.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 30px;background:#1f4023;color:#a9c4ad;font-size:12px;text-align:center;">
            Family Garden · Vințu de Jos, Alba · cultivat cu dragoste 🌱
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildCustomerHtml(order) {
  const items = (order.items || [])
    .map(
      (it) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e3ebde;font-size:14px;">${it.quantity} × ${it.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e3ebde;font-size:14px;text-align:right;font-weight:600;">${formatRON(it.price * it.quantity)}</td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ro"><body style="margin:0;background:#f8f5ed;font-family:Arial,Helvetica,sans-serif;color:#1f4023;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:30px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;">
  <tr><td style="background:linear-gradient(135deg,#2f6a36,#4f8f43);padding:30px;color:white;text-align:center;">
    <h1 style="margin:0;font-size:24px;">Mulțumim pentru comandă, ${order.customerName?.split(" ")[0] || ""}! 🌱</h1>
    <p style="margin:10px 0 0;opacity:0.9;">Comanda ta <strong>#${order.orderNumber}</strong> a fost înregistrată.</p>
  </td></tr>
  <tr><td style="padding:24px 30px;">
    <p style="font-size:15px;line-height:1.6;color:#516454;">Te vom contacta telefonic la <strong>${order.customerPhone}</strong> pentru a confirma comanda și detaliile de livrare.</p>
    <h2 style="margin:20px 0 10px;font-size:16px;">Sumarul comenzii</h2>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e3ebde;border-radius:12px;overflow:hidden;">
      ${items}
      <tr><td style="padding:10px 12px;background:#eef3ea;font-weight:700;">Total</td><td style="padding:10px 12px;background:#eef3ea;text-align:right;font-weight:800;color:#2f6a36;">${formatRON(order.total)}</td></tr>
    </table>
    <p style="margin-top:18px;font-size:14px;color:#516454;"><strong>Livrare:</strong> ${order.deliveryMethod}<br/><strong>Plată:</strong> ${order.paymentMethod}</p>
  </td></tr>
  <tr><td style="padding:18px;background:#1f4023;color:#a9c4ad;font-size:12px;text-align:center;">
    Family Garden · 0749 476 386 · Vințu de Jos, Alba
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

/**
 * Send order email notifications (admin + customer if email present).
 * Non-blocking: failures are logged but never throw.
 */
export async function sendOrderEmails(order) {
  const client = getClient();
  if (!client) {
    console.warn("[email] RESEND_API_KEY not set, skipping email notifications");
    return { sent: false, reason: "no_api_key" };
  }
  const from = process.env.RESEND_FROM_EMAIL || "Family Garden <onboarding@resend.dev>";
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  const results = { admin: [], customer: null };

  // Send admin notification (one per email - some Resend plans require this)
  for (const to of adminEmails) {
    try {
      const r = await client.emails.send({
        from,
        to,
        subject: `🌱 Comandă nouă #${order.orderNumber} – ${order.customerName} (${formatRON(order.total)})`,
        html: buildOrderHtml(order),
        replyTo: order.customerEmail || undefined,
      });
      results.admin.push({ to, ok: !r.error, id: r.data?.id, error: r.error?.message });
      if (r.error) console.error(`[email] Failed to send admin email to ${to}:`, r.error);
    } catch (e) {
      results.admin.push({ to, ok: false, error: e.message });
      console.error(`[email] Exception sending admin email to ${to}:`, e.message);
    }
  }

  // Send customer confirmation if email provided
  if (order.customerEmail) {
    try {
      const r = await client.emails.send({
        from,
        to: order.customerEmail,
        subject: `Comanda ta Family Garden #${order.orderNumber} a fost primită 🌱`,
        html: buildCustomerHtml(order),
      });
      results.customer = { to: order.customerEmail, ok: !r.error, id: r.data?.id, error: r.error?.message };
      if (r.error) console.error(`[email] Failed to send customer email:`, r.error);
    } catch (e) {
      results.customer = { to: order.customerEmail, ok: false, error: e.message };
      console.error(`[email] Exception sending customer email:`, e.message);
    }
  }

  return { sent: true, ...results };
}
