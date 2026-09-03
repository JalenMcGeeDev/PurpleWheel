import { NextRequest, NextResponse } from 'next/server';
import { getEmailSignups } from '../../../../lib/db';
import { getResend } from '../../../../lib/email';

const FROM = 'The Purple Wheel <noreply@purplewheel.store>';

export async function POST(req: NextRequest) {
  const { subject, body } = await req.json() as { subject?: string; body?: string };
  if (!subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: 'Subject and body are required.' }, { status: 400 });
  }

  const signups = await getEmailSignups();
  if (signups.length === 0) {
    return NextResponse.json({ error: 'No subscribers to send to.' }, { status: 400 });
  }

  const emails = signups.map((s) => s.email);

  // Send in batches of 50 (Resend free tier limit per request)
  const BATCH = 50;
  let sent = 0;
  for (let i = 0; i < emails.length; i += BATCH) {
    const batch = emails.slice(i, i + BATCH);
    await getResend().emails.send({
      from: FROM,
      to: FROM,      // send to self
      bcc: batch,    // BCC all subscribers so addresses stay private
      subject: subject.trim(),
      text: body.trim(),
    });
    sent += batch.length;
  }

  return NextResponse.json({ message: `Sent to ${sent} subscriber${sent !== 1 ? 's' : ''}.` });
}
