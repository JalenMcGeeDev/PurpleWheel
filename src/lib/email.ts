import { Resend } from 'resend';
import type { Reservation, Popup, HostInquiry } from '../types';
import { format } from 'date-fns';

const getResend = () => new Resend(process.env.RESEND_API_KEY);
const FROM = 'The Purple Wheel <noreply@purplewheel.store>';
const SUNSHINE = 'sunshine.alv5@gmail.com';

export async function sendReservationConfirmation(
  reservation: Reservation,
  popup: Popup,
): Promise<void> {
  const dateStr = format(new Date(popup.startsAt), 'EEEE, MMMM d');
  const timeStr = `${format(new Date(popup.startsAt), 'h:mm a')} – ${format(new Date(popup.endsAt), 'h:mm a')}`;

  const itemsHtml = reservation.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:6px 12px 6px 0">${item.productName}</td>
          <td style="padding:6px 12px">~${item.requestedAmount} ${item.unit.replace('per ', '')}</td>
          <td style="padding:6px 0;text-align:right">~$${item.estimatedCost.toFixed(2)}</td>
        </tr>`,
    )
    .join('');

  const containerNote = reservation.bringingOwnContainer
    ? '✓ You\'re bringing your own container - 10% discount applied to estimate.'
    : 'No container - a $2.00 jar deposit will be collected at the popup.';

  await getResend().emails.send({
    from: FROM,
    to: reservation.email,
    subject: `Your reservation is confirmed - ${popup.title} on ${dateStr}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1A1A1A">
        <div style="background:#8B5CF6;padding:24px 32px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;font-size:22px;margin:0">The Purple Wheel</h1>
          <p style="color:#DDD3FB;margin:4px 0 0">Reservation confirmed</p>
        </div>
        <div style="background:#FAF6EE;padding:32px;border-radius:0 0 8px 8px">
          <p>Hi ${reservation.customerName},</p>
          <p>Your refill reservation is set. Bring this email (or just your order code) to the popup.</p>

          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:20px 0">
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Order code</p>
            <p style="font-size:28px;font-weight:700;color:#4C1D95;letter-spacing:.1em;margin:0">${reservation.orderCode}</p>
          </div>

          <h2 style="font-size:16px;margin:24px 0 8px;color:#4C1D95">Popup details</h2>
          <p style="margin:0"><strong>${popup.title}</strong></p>
          <p style="margin:4px 0">${dateStr}, ${timeStr}</p>
          <p style="margin:4px 0 0">${popup.address}</p>
          ${popup.notes ? `<p style="margin:8px 0 0;font-size:14px;color:#6b7280">${popup.notes}</p>` : ''}

          <h2 style="font-size:16px;margin:24px 0 8px;color:#4C1D95">Your items</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            ${itemsHtml}
            <tr style="border-top:1px solid #e5e7eb">
              <td colspan="2" style="padding:8px 12px 0 0;font-weight:600">Estimated total</td>
              <td style="padding:8px 0 0;text-align:right;font-weight:600">~$${reservation.estimatedTotal.toFixed(2)}</td>
            </tr>
          </table>
          <p style="font-size:12px;color:#6b7280;margin:8px 0 0">
            Estimate only - you pay by actual weight at the popup.
          </p>

          <p style="margin-top:16px;font-size:14px">${containerNote}</p>

          <p style="margin-top:24px;font-size:13px;color:#6b7280">
            Questions? Reply to this email or DM @${process.env.NEXT_PUBLIC_INSTAGRAM ?? 'thepurplewheel'} on Instagram.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendReservationNotification(
  reservation: Reservation,
  popup: Popup,
): Promise<void> {
  const dateStr = format(new Date(popup.startsAt), 'EEE MMM d');
  const itemList = reservation.items
    .map((i) => `• ${i.productName}: ~${i.requestedAmount} ${i.unit.replace('per ', '')}`)
    .join('\n');

  await getResend().emails.send({
    from: FROM,
    to: SUNSHINE,
    subject: `New reservation ${reservation.orderCode} - ${popup.title} ${dateStr}`,
    html: `
      <p><strong>${reservation.customerName}</strong> (${reservation.email}${reservation.phone ? `, ${reservation.phone}` : ''}) reserved for ${popup.title} on ${dateStr}.</p>
      <p>Order: <strong>${reservation.orderCode}</strong></p>
      <pre style="background:#f4f4f4;padding:12px;border-radius:4px">${itemList}</pre>
      <p>Container: ${reservation.bringingOwnContainer ? 'Yes - bringing own' : 'No - jar deposit needed'}</p>
      <p>Est. total: $${reservation.estimatedTotal.toFixed(2)}</p>
    `,
  });
}

export async function sendHostInquiryNotification(inquiry: HostInquiry): Promise<void> {
  await getResend().emails.send({
    from: FROM,
    to: SUNSHINE,
    subject: `New hosting inquiry - ${inquiry.organization}`,
    html: `
      <p><strong>${inquiry.name}</strong> from <strong>${inquiry.organization}</strong> wants to host a popup.</p>
      <p>Type: ${inquiry.locationType} | Audience: ${inquiry.estimatedAudience ?? 'not specified'}</p>
      <p>Email: ${inquiry.email}${inquiry.phone ? ` | Phone: ${inquiry.phone}` : ''}</p>
      <p>Message:</p>
      <blockquote style="border-left:3px solid #8B5CF6;padding-left:12px;color:#374151">${inquiry.message}</blockquote>
    `,
  });
}

export async function sendProductRequestNotification(
  productName: string,
  category: string | undefined,
  notes: string | undefined,
  submitterName: string | undefined,
  email: string | undefined,
): Promise<void> {
  await getResend().emails.send({
    from: FROM,
    to: SUNSHINE,
    subject: `New product request: ${productName}`,
    html: `
      <p>Someone requested a new refillable product.</p>
      <p><strong>Product:</strong> ${productName}</p>
      ${category ? `<p><strong>Category:</strong> ${category}</p>` : ''}
      ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
      ${submitterName || email ? `<p><strong>From:</strong> ${submitterName ?? ''}${email ? ` (${email})` : ''}</p>` : ''}
    `,
  });
}

export async function sendPopupReminder(
  reservation: Reservation,
  popup: Popup,
): Promise<void> {
  const timeStr = format(new Date(popup.startsAt), 'h:mm a');
  await getResend().emails.send({
    from: FROM,
    to: reservation.email,
    subject: `Reminder: your refill pickup is today - ${popup.venueName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1A1A1A">
        <div style="background:#8B5CF6;padding:24px 32px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;font-size:22px;margin:0">The Purple Wheel</h1>
          <p style="color:#DDD3FB;margin:4px 0 0">Popup reminder</p>
        </div>
        <div style="background:#FAF6EE;padding:32px;border-radius:0 0 8px 8px">
          <p>Hi ${reservation.customerName} - today's the day!</p>
          <p>Your order <strong>${reservation.orderCode}</strong> is ready to pick up.</p>
          <p><strong>${popup.venueName}</strong> · ${timeStr}<br>${popup.address}</p>
          ${popup.notes ? `<p style="font-size:14px;color:#6b7280">${popup.notes}</p>` : ''}
        </div>
      </div>
    `,
  });
}


