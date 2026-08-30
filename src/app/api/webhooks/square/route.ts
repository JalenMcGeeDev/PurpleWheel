import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { getPOSTransactionByCheckoutId, updatePOSTransaction } from '../../../../lib/db';

const STATUS_MAP: Record<string, 'completed' | 'cancelled' | 'failed'> = {
  COMPLETED: 'completed',
  CANCELED:  'cancelled',
  FAILED:    'failed',
};

function verifySignature(body: string, signature: string, url: string): boolean {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!key) return false;
  const hmac = createHmac('sha256', key).update(url + body).digest('base64');
  return hmac === signature;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-square-hmacsha256-signature') ?? '';
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/square`;

  if (!verifySignature(body, signature, url)) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  if (event.type !== 'terminal.checkout.updated') {
    return NextResponse.json({ ok: true }); // acknowledge other events
  }

  const checkout = (event.data as Record<string, unknown>)?.object as Record<string, unknown> | undefined;
  const checkoutObj = checkout?.checkout as Record<string, unknown> | undefined;
  if (!checkoutObj) return NextResponse.json({ ok: true });

  const squareCheckoutId = checkoutObj.id as string;
  const squareStatus     = checkoutObj.status as string;
  const paymentIds       = checkoutObj.payment_ids as string[] | undefined;

  const internalStatus = STATUS_MAP[squareStatus];
  if (!internalStatus) return NextResponse.json({ ok: true }); // still pending

  const tx = await getPOSTransactionByCheckoutId(squareCheckoutId).catch(() => null);
  if (!tx) return NextResponse.json({ ok: true }); // unknown transaction

  await updatePOSTransaction(
    tx.id,
    internalStatus,
    paymentIds?.[0],
    internalStatus === 'completed' ? new Date().toISOString() : undefined,
  ).catch(() => {});

  return NextResponse.json({ ok: true });
}
