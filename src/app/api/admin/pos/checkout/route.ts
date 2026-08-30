import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { savePOSTransaction, getActiveTerminal } from '../../../../../lib/db';
import { createTerminalCheckout } from '../../../../../lib/square';
import type { POSTransaction } from '../../../../../types';

export async function POST(req: NextRequest) {
  const { amountCents, popupId } = await req.json() as { amountCents: number; popupId?: string };

  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    return NextResponse.json({ error: 'Invalid amount.' }, { status: 400 });
  }

  const terminal = await getActiveTerminal();
  if (!terminal) {
    return NextResponse.json(
      { error: 'No terminal paired. Go to /admin/pos/pair to pair a terminal.' },
      { status: 400 },
    );
  }

  const txId = `pos-${randomUUID().slice(0, 8)}`;

  let squareCheckoutId: string;
  try {
    const result = await createTerminalCheckout({
      amountCents,
      deviceId: terminal.squareDeviceId,
      locationId: terminal.locationId,
      referenceId: txId,
    });
    squareCheckoutId = result.checkoutId;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create Terminal checkout.' },
      { status: 502 },
    );
  }

  const tx: POSTransaction = {
    id: txId,
    squareCheckoutId: squareCheckoutId,
    amountCents,
    popupId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  await savePOSTransaction(tx);

  return NextResponse.json({ txId, squareCheckoutId });
}
