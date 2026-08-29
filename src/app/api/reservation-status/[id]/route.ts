import { NextRequest, NextResponse } from 'next/server';
import { updateReservationStatus } from '../../../../lib/db';
import { validateAdminToken } from '../../../../lib/supabase-auth';
import type { Reservation } from '../../../../types';

const VALID_STATUSES: Reservation['status'][] = ['new', 'prepped', 'collected', 'no-show'];

function isAuthorized(req: NextRequest) {
  return validateAdminToken(req);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { status } = body as { status?: unknown };
  if (!status || !VALID_STATUSES.includes(status as Reservation['status'])) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }

  const updated = await updateReservationStatus(id, status as Reservation['status']);
  if (!updated) {
    return NextResponse.json({ error: 'Reservation not found.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
