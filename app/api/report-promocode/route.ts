// C:\promocode-share\app\api\report-promocode\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'; // Supabaseクライアントをインポート

// Supabaseの環境変数を取得
// Vercelの環境変数に設定されていることを前提とします
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 環境変数が設定されているか確認
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase環境変数が設定されていません。');
  // 本番環境では、より詳細なエラーメッセージを避けるべきです
  throw new Error('Supabase environment variables are not set.');
}

// Supabaseクライアントを初期化
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: NextRequest) {
  // POSTメソッド以外は許可しない
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    // リクエストボディからpromocodeIdとreasonを取得
    const { promocodeId, reason } = await req.json();

    // 必須フィールドのチェック
    if (!promocodeId || !reason) {
      return NextResponse.json({ message: 'Missing required fields: promocodeId and reason' }, { status: 400 });
    }

    // Supabaseに報告データを挿入
    // ここでは 'reported_promocodes' という新しいテーブルを想定しています。
    // このテーブルは、id (UUID), promocode_id (UUID), reason (TEXT), created_at (TIMESTAMP WITH TIME ZONE), status (TEXT, 例: 'pending')
    // などのカラムを持つ必要があります。
    const { data, error } = await supabase
      .from('reported_promocodes')
      .insert([
        { 
          promocode_id: promocodeId, 
          reason: reason,
          status: 'pending' // 初期ステータスを 'pending' (保留中) に設定
          // 必要であれば、報告者のuser_idも追加できます
          // reporter_user_id: (await supabase.auth.getSession()).data.session?.user.id,
        }
      ]);

    if (error) {
      console.error('Error inserting report into Supabase:', error);
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
