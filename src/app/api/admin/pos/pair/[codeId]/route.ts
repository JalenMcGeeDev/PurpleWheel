import { NextRequest, NextResponse } from 'next/server';
import { getDeviceCode } from '../../../../../../lib/square';
import { saveTerminal, getAllTerminals } from '../../../../../../lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ codeId: string }> },
) {
  const { codeId } = await params;
  const locationId = req.nextUrl.searchParams.get('locationId') ?? '';

  try {
    const result = await getDeviceCode(codeId);

    if (result.status === 'PAIRED' && result.deviceId) {
      const existing = await getAllTerminals();
      const alreadySaved = existing.some((t) => t.squareDeviceId === result.deviceId);
      if (!alreadySaved) {
        await saveTerminal({
          name: 'Square Terminal',
          squareDeviceId: result.deviceId,
          locationId,
          isActive: true,
        });
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to check pairing.' },
      { status: 502 },
    );
  }
}
