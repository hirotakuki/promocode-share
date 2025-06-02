// app/api/admin/promocodes/route.ts
import { createClient } from '@supabase/supabase-js'; // createClient をインポート
import { NextResponse } from 'next/server';

// サーバーサイドで安全に環境変数を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// サービスロールキーを使用するSupabaseクライアント（RLSをバイパス）
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false, // セッションを永続化しない（APIルートなので不要）
  },
});

export async function GET() {
  try {
    // 全プロモコードと投稿者情報（profiles テーブルから）を結合して取得
    // RLSをバイパスするため、supabaseAdmin クライアントを使用
    const { data: promoData, error: fetchPromoError } = await supabaseAdmin
      .from('promocodes')
      .select(`
        *,
        user:profiles(email)
      `)
      .order('created_at', { ascending: false });

    if (fetchPromoError) {
      console.error('Error fetching promocodes for admin:', fetchPromoError);
      return NextResponse.json({ error: 'Failed to fetch promocodes' }, { status: 500 });
    }

    // 報告されたプロモコードを取得
    // ★★★ 修正ポイント: .eq('status', 'pending') を削除しました ★★★
    const { data: reportedData, error: fetchReportedError } = await supabaseAdmin // こちらも supabaseAdmin を使用
      .from('reported_promocodes')
      .select(`
        id,
        promocode_id,
        reason,
        created_at,
        status,
        promocode:promocodes(service_name, code, discount, category_slug)
      `)
      .order('created_at', { ascending: false });

    if (fetchReportedError) {
      console.error('Error fetching reported promocodes for admin:', fetchReportedError);
      return NextResponse.json({ error: 'Failed to fetch reported promocodes' }, { status: 500 });
    }

    return NextResponse.json({ promocodes: promoData, reportedPromocodes: reportedData });

  } catch (error: any) { // エラーの型を any に変更
    console.error('API Route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}