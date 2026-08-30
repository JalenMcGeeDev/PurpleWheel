import { NextResponse } from 'next/server';
import { getSquareLocations, createDeviceCode } from '../../../../../lib/square';

export async function POST() {
  try {
    const locationId = process.env.SQUARE_LOCATION_ID
      ?? (await getSquareLocations())[0]?.id;
    if (!locationId) {
      return NextResponse.json({ error: 'No Square location found.' }, { status: 400 });
    }
    const result = await createDeviceCode(locationId);
    return NextResponse.json({ ...result, locationId });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create device code.' },
      { status: 502 },
    );
  }
}
