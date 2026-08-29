import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import type { Reservation, ReservationItem } from '../../../types';
import { generateOrderCode } from '../../../lib/orderCode';
import { saveReservation, getPopupById } from '../../../lib/db';
import { sendReservationConfirmation, sendReservationNotification } from '../../../lib/email';

// Simple in-memory rate limiting: max 5 submissions per IP per 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const data = body as Record<string, unknown>;

  // Honeypot check — if _trap has a value, silently succeed without storing
  if (data._trap) {
    return NextResponse.json({ orderCode: generateOrderCode() });
  }

  const { popupId, customerName, email, phone, items, bringingOwnContainer, estimatedTotal } = data;

  // Basic validation
  if (
    typeof popupId !== 'string' ||
    typeof customerName !== 'string' ||
    typeof email !== 'string' ||
    !Array.isArray(items) ||
    items.length === 0 ||
    typeof bringingOwnContainer !== 'boolean' ||
    typeof estimatedTotal !== 'number'
  ) {
    return NextResponse.json({ error: 'Missing or invalid fields.' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
  }

  const popup = await getPopupById(popupId);
  if (!popup) {
    return NextResponse.json({ error: 'Popup not found.' }, { status: 404 });
  }
  if (popup.status === 'cancelled') {
    return NextResponse.json({ error: 'This popup has been cancelled.' }, { status: 400 });
  }
  if (!popup.preordersEnabled || new Date(popup.preorderCutoff) <= new Date()) {
    return NextResponse.json({ error: 'Pre-orders are closed for this popup.' }, { status: 400 });
  }

  const reservation: Reservation = {
    id: randomUUID(),
    orderCode: generateOrderCode(),
    popupId,
    customerName: String(customerName).trim().slice(0, 100),
    email: String(email).trim().toLowerCase().slice(0, 200),
    phone: typeof phone === 'string' ? phone.trim().slice(0, 30) : undefined,
    items: (items as ReservationItem[]).slice(0, 20),
    bringingOwnContainer,
    estimatedTotal,
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  try {
    await saveReservation(reservation);
  } catch (err) {
    console.error('Failed to save reservation:', err);
    // Continue — email still goes out even if storage fails
  }

  // Send emails (non-blocking on error — reservation is still confirmed)
  sendReservationConfirmation(reservation, popup).catch((err) =>
    console.error('Confirmation email failed:', err),
  );
  sendReservationNotification(reservation, popup).catch((err) =>
    console.error('Notification email failed:', err),
  );

  return NextResponse.json({ orderCode: reservation.orderCode }, { status: 201 });
}
