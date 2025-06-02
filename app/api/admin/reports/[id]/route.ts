// app/api/admin/reports/[id]/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // ★ここを修正: params を Promise でラップ★
) {
  // ★追加: params Promise を解決してから id にアクセス★
  const resolvedParams = await params;
  const reportId = resolvedParams.id;
  const { status } = await request.json(); // status (e.g., 'resolved', 'dismissed') を取得

  if (!reportId || !status) {
    return NextResponse.json({ error: 'Report ID and status are required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('reported_promocodes')
      .update({ status: status })
      .eq('id', reportId)
      .select(); // 更新されたデータを取得

    if (error) {
      console.error('Error updating reported promocode status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 200 }); // 更新された報告を返す
  } catch (e) {
    console.error('API Route error (PATCH report):', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}