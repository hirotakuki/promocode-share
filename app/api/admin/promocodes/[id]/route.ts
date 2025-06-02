// app/api/admin/promocodes/[id]/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

// DELETE 関数
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // ここを修正: params を Promise でラップ
) {
  // params Promise を解決してから id にアクセス
  const resolvedParams = await params;
  const promocodeId = resolvedParams.id;

  if (!promocodeId) {
    return NextResponse.json({ error: 'Promocode ID is required' }, { status: 400 });
  }

  try {
    const { error: deleteError } = await supabaseAdmin
      .from('promocodes')
      .delete()
      .eq('id', promocodeId);

    if (deleteError) {
      console.error('Error deleting promocode:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Promocode deleted successfully' }, { status: 200 });
  } catch (e) {
    console.error('API Route error (DELETE promocode):', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH 関数 (同様に修正)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // ここを修正: params を Promise でラップ
) {
  // params Promise を解決してから id にアクセス
  const resolvedParams = await params;
  const promocodeId = resolvedParams.id;
  const body = await request.json();

  if (!promocodeId) {
    return NextResponse.json({ error: 'Promocode ID is required' }, { status: 400 });
  }

  try {
    const { data, error: updateError } = await supabaseAdmin
      .from('promocodes')
      .update(body)
      .eq('id', promocodeId)
      .select(`
        *,
        user:profiles(email)
      `);

    if (updateError) {
      console.error('Error updating promocode:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 200 });
  } catch (e) {
    console.error('API Route error (PATCH promocode):', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}