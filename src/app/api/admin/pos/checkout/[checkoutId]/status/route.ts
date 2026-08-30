import { NextRequest, NextResponse } from 'next/server';
import { getTerminalCheckoutStatus } from '../../../../../../../lib/square';
import { getPOSTransactionByCheckoutId, updatePOSTransaction } from '../../../../../../../lib/db';

const STATUS_MAP: Record<string, 'pending' | 'completed' | 'cancelled' | 'failed'> = {
  PENDING:          'pending',
  IN_PROGRESS:      'pending',
  CANCEL_REQUESTED: 'cancelled',
  COMPLETED:        'completed',
  CANCELED:         'cancelled',
  FAILED:           'failed',
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ checkoutId: string }> },
) {
  const { checkoutId } = await params;

  // Prefer DB status (updated by webhook) — avoids hitting Square API on every poll
  const tx = await getPOSTransactionByCheckoutId(checkoutId).catch(() => null);
  if (tx && tx.status !== 'pending') {
    return NextResponse.json({ status: tx.status });
  }

  // Fallback: ask Square directly (catches cases where webhook hasn't fired yet)
  try {
    const result = await getTerminalCheckoutStatus(checkoutId);
    const status = STATUS_MAP[result.squareStatus] ?? 'pending';

    if (status !== 'pending' && tx) {
      await updatePOSTransaction(
        tx.id,
        status,
        result.squareTransactionId,
        status === 'completed' ? new Date().toISOString() : undefined,
      ).catch(() => {});
    }

    return NextResponse.json({ status, squareStatus: result.squareStatus });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to get status.' },
      { status: 502 },
    );
  }
}
