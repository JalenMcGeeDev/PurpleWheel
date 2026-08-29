import { NextRequest, NextResponse } from 'next/server';
import { generateICS } from '../../../../lib/ics';
import { getPopupById } from '../../../../lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ popupId: string }> },
) {
  const { popupId } = await params;
  const popup = await getPopupById(popupId);

  if (!popup) {
    return NextResponse.json({ error: 'Popup not found.' }, { status: 404 });
  }

  const ics = generateICS(popup);
  const filename = `purple-wheel-${popup.id}.ics`;

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
