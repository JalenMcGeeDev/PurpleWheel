import { NextRequest, NextResponse } from 'next/server';
import { saveEmailSignup } from '../../../lib/db';

export async function POST(req: NextRequest) {
  const body = await req.json() as { email?: string; _trap?: string };

  // Honeypot — bots fill hidden fields
  if (body._trap) return NextResponse.json({ ok: true });

  const email = body.email?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email.' }, { status: 400 });
  }

  await saveEmailSignup(email);
  return NextResponse.json({ ok: true });
}
