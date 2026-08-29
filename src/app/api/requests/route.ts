import { NextRequest, NextResponse } from 'next/server';
import { saveProductRequest } from '../../../lib/db';
import { sendProductRequestNotification } from '../../../lib/email';

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
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  if (data._trap) return NextResponse.json({ ok: true }); // honeypot

  const productName = typeof data.productName === 'string' ? data.productName.trim().slice(0, 150) : '';
  if (!productName) {
    return NextResponse.json({ error: 'Product name is required.' }, { status: 400 });
  }

  const request = {
    productName,
    category: typeof data.category === 'string' ? data.category.slice(0, 50) : undefined,
    notes: typeof data.notes === 'string' ? data.notes.trim().slice(0, 1000) : undefined,
    email: typeof data.email === 'string' ? data.email.trim().toLowerCase().slice(0, 200) : undefined,
    submitterName: typeof data.submitterName === 'string' ? data.submitterName.trim().slice(0, 100) : undefined,
  };

  try {
    await saveProductRequest(request);
  } catch (err) {
    console.error('Failed to save product request:', err);
  }

  sendProductRequestNotification(
    request.productName,
    request.category,
    request.notes,
    request.submitterName,
    request.email,
  ).catch((err) => console.error('Product request email failed:', err));

  return NextResponse.json({ ok: true }, { status: 201 });
}
