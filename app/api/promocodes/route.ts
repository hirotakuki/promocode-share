// C:\promocode-share\app\api\promocodes\route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // 上記で作成したファイル

export async function GET() {
  const { data, error } = await supabase.from('promocodes').select('*');

  if (error) {
    console.error('Error fetching promocodes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { code, description, discount, affiliate_link } = await req.json();

  const { data, error } = await supabase
    .from('promocodes')
    .insert([{ code, description, discount, affiliate_link }]);

  if (error) {
    console.error('Error inserting promocode:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}