import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { savePOSTransaction } from '../../../../../lib/db';
import type { POSTransaction } from '../../../../../types';

export async function POST(req: NextRequest) {
  const { amountCents, popupId } = await req.json() as { amountCents: number; popupId?: string };

  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    return NextResponse.json({ error: 'Invalid amount.' }, { status: 400 });
  }

  const txId = `pos-${randomUUID().slice(0, 8)}`;
  const tx: POSTransaction = {
    id: txId,
    amountCents,
    popupId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  await savePOSTransaction(tx);

  return NextResponse.json({ txId });
}
