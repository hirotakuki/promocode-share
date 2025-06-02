// C:\promocode-share\middleware.ts

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // この行が重要です: リクエストの度にセッションを更新し、
  // Supabaseの認証クッキーを適切に設定または更新します。
  await supabase.auth.getSession();

  return res;
}