import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { savePopup } from '../../../../lib/db';
import { validateAdminToken } from '../../../../lib/supabase-auth';
import type { Popup } from '../../../../types';

function isAuthorized(req: NextRequest) {
  return validateAdminToken(req);
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const body = (await req.json()) as Partial<Omit<Popup, 'id'>>;
  if (!body.title || !body.startsAt || !body.endsAt || !body.venueName || !body.address || !body.city) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const id = `popup-${randomUUID().slice(0, 8)}`;
  await savePopup(id, {
    title: body.title,
    startsAt: body.startsAt,
    endsAt: body.endsAt,
    venueName: body.venueName,
    address: body.address,
    city: body.city as Popup['city'],
    notes: body.notes,
    preordersEnabled: body.preordersEnabled ?? true,
    preorderCutoff: body.preorderCutoff ?? body.startsAt,
    status: body.status ?? 'scheduled',
    isPublic: body.isPublic ?? true,
    geo: body.geo,
  });

  return NextResponse.json({ id }, { status: 201 });
}
