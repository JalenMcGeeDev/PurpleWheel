import { NextRequest, NextResponse } from 'next/server';
import { savePopup, deletePopup, getPopupById } from '../../../../../lib/db';
import { validateAdminToken } from '../../../../../lib/supabase-auth';
import type { Popup } from '../../../../../types';

function isAuthorized(req: NextRequest) {
  return validateAdminToken(req);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const { id } = await params;
  const existing = await getPopupById(id);
  if (!existing) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const body = (await req.json()) as Partial<Omit<Popup, 'id'>>;
  await savePopup(id, { ...existing, ...body });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const { id } = await params;
  await deletePopup(id);
  return NextResponse.json({ ok: true });
}
