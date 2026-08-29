import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import type { HostInquiry } from '../../../types';
import { saveHostInquiry } from '../../../lib/db';
import { sendHostInquiryNotification } from '../../../lib/email';

const VALID_LOCATION_TYPES = ['office', 'apartment community', 'retail', 'other'];

// Rate limiting: max 3 submissions per IP per 10 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 3) return false;
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

  // Honeypot check
  if (data._trap) {
    return NextResponse.json({ ok: true });
  }

  const { name, organization, email, phone, locationType, estimatedAudience, message } = data;

  if (
    typeof name !== 'string' ||
    typeof organization !== 'string' ||
    typeof email !== 'string' ||
    typeof message !== 'string' ||
    typeof locationType !== 'string' ||
    !VALID_LOCATION_TYPES.includes(locationType)
  ) {
    return NextResponse.json({ error: 'Missing or invalid fields.' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
  }

  const inquiry: HostInquiry = {
    id: randomUUID(),
    name: name.trim().slice(0, 100),
    organization: organization.trim().slice(0, 150),
    email: email.trim().toLowerCase().slice(0, 200),
    phone: typeof phone === 'string' ? phone.trim().slice(0, 30) : undefined,
    locationType: locationType as HostInquiry['locationType'],
    estimatedAudience:
      typeof estimatedAudience === 'string' ? estimatedAudience.trim().slice(0, 100) : undefined,
    message: message.trim().slice(0, 2000),
    createdAt: new Date().toISOString(),
  };

  try {
    await saveHostInquiry(inquiry);
  } catch (err) {
    console.error('Failed to save host inquiry:', err);
  }

  sendHostInquiryNotification(inquiry).catch((err) =>
    console.error('Host inquiry email failed:', err),
  );

  return NextResponse.json({ ok: true }, { status: 201 });
}
