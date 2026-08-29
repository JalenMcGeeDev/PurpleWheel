import { NextRequest, NextResponse } from 'next/server';
import { validateAdminToken } from '../../../../../../../lib/supabase-auth';
import { cancelTerminalCheckout } from '../../../../../../../lib/square';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ checkoutId: string }> },
) {
  if (!await validateAdminToken(req)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { checkoutId } = await params;

  try {
    await cancelTerminalCheckout(checkoutId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Cancel failed.' },
      { status: 502 },
    );
  }
}
