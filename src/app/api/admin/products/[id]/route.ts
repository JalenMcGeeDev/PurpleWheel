import { NextRequest, NextResponse } from 'next/server';
import { updateProduct } from '../../../../../lib/db';
import { validateAdminToken } from '../../../../../lib/supabase-auth';

function isAuthorized(req: NextRequest) {
  return validateAdminToken(req);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const { id } = await params;
  const body = (await req.json()) as { available?: boolean; pricePerUnit?: number; taxable?: boolean };
  await updateProduct(id, body);
  return NextResponse.json({ ok: true });
}
