import { NextRequest, NextResponse } from 'next/server';
import { getTerminalCheckoutStatus } from '../../../../../../../lib/square';
import { updatePOSTransaction } from '../../../../../../../lib/db';

const STATUS_MAP: Record<string, 'pending' | 'completed' | 'cancelled' | 'failed'> = {
  PENDING:          'pending',
  IN_PROGRESS:      'pending',
  CANCEL_REQUESTED: 'pending',
  COMPLETED:        'completed',
  CANCELED:         'cancelled',
  FAILED:           'failed',
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ checkoutId: string }> },
) {
  const { checkoutId } = await params;
  const txId = req.nextUrl.searchParams.get('txId');

  try {
    const result = await getTerminalCheckoutStatus(checkoutId);
    const status = STATUS_MAP[result.squareStatus] ?? 'pending';

    if (txId && status !== 'pending') {
      await updatePOSTransaction(
        txId,
        status,
        result.squareTransactionId,
        status === 'completed' ? new Date().toISOString() : undefined,
      ).catch(() => {}); // don't fail the poll if DB update fails
    }

    return NextResponse.json({ status, squareStatus: result.squareStatus });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to get status.' },
      { status: 502 },
    );
  }
}
