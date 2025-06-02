// C:\promocode-share\app\api\report-promocode\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    // ★追加: 受信したリクエストのCookieヘッダーをログ出力
    const cookieHeader = req.headers.get('Cookie');
    console.log('API Route - Received Cookie Header:', cookieHeader);

    const supabase = createServerComponentClient({ cookies });

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('API Route - Session Error or No Session:', sessionError);
      console.error('API Route - Current Session Object:', session); // ★追加: sessionオブジェクトもログ出力
      return NextResponse.json({ message: 'Unauthorized: User not logged in' }, { status: 401 });
    }

    // ... (以降の処理は変更なし) ...
    const { promocodeId, reason } = await req.json();

    if (!promocodeId || !reason) {
      return NextResponse.json({ message: 'Missing required fields: promocodeId and reason' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('reported_promocodes')
      .insert([
        {
          promocode_id: promocodeId,
          reason: reason,
          status: 'pending',
        }
      ]);

    if (error) {
      console.error('Error inserting report into Supabase:', error);
      return NextResponse.json({ message: `Failed to report promocode: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ message: 'Promocode reported successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error handling report request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ message: `Failed to report promocode: ${errorMessage}` }, { status: 500 });
  }
}