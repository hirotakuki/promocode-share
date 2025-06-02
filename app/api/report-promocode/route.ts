// C:\promocode-share\app\api\report-promocode\route.ts

import { NextRequest, NextResponse } from 'next/server';
// サーバーサイドで Supabase クライアントを作成するためのインポート
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers'; // Next.js 13以降の cookies() 関数をインポート

// Supabaseの環境変数はVercelに設定済みとしていますが、
// createServerComponentClient は通常これらの変数なしで動作します。

export async function POST(req: NextRequest) {
  // POSTメソッド以外は許可しない
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    // サーバーサイドで認証済みの Supabase クライアントを作成
    // cookies() を使うことで、リクエストのクッキーからセッション情報を取得します
    const supabase = createServerComponentClient({ cookies });

    // ユーザーセッションを取得して、認証状態を確認
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('Session Error or No Session:', sessionError);
      // ユーザーが認証されていない場合は401 Unauthorizedを返す
      return NextResponse.json({ message: 'Unauthorized: User not logged in' }, { status: 401 });
    }

    // リクエストボディからpromocodeIdとreasonを取得
    const { promocodeId, reason } = await req.json();

    // 必須フィールドのチェック
    if (!promocodeId || !reason) {
      return NextResponse.json({ message: 'Missing required fields: promocodeId and reason' }, { status: 400 });
    }

    // Supabaseに報告データを挿入
    const { data, error } = await supabase
      .from('reported_promocodes')
      .insert([
        {
          promocode_id: promocodeId,
          reason: reason,
          status: 'pending', // 初期ステータスを 'pending' (保留中) に設定
          // ユーザーIDを報告データに追加することも可能 (RLSポリシーと同期していれば)
          // reporter_user_id: session.user.id,
        }
      ]);

    if (error) {
      console.error('Error inserting report into Supabase:', error);
      // Supabaseからのエラーメッセージを詳細に返す
      return NextResponse.json({ message: `Failed to report promocode: ${error.message}` }, { status: 500 });
    }

    // 成功レスポンス
    return NextResponse.json({ message: 'Promocode reported successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error handling report request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ message: `Failed to report promocode: ${errorMessage}` }, { status: 500 });
  }
}