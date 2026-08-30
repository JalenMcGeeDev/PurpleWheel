import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** For server components and server actions - reads from the cookie store */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(URL, ANON, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
    },
  });
}

/** For API route handlers - reads cookies from the incoming NextRequest */
export function createSupabaseRequestClient(req: NextRequest) {
  return createServerClient(URL, ANON, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: () => {},
    },
  });
}

/** Validates a Bearer JWT token - use in admin API routes */
export async function validateAdminToken(req: NextRequest): Promise<boolean> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return false;
  const supabase = createSupabaseRequestClient(req);
  const { data: { user } } = await supabase.auth.getUser(token);
  return !!user;
}

