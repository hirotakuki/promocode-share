// app/promocode/[id]/page.tsx
// 'use client'; // サーバーコンポーネントなので不要

import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import AdAndCodeDisplay from '@/app/components/AdAndCodeDisplay'; // パスを修正済み

// プロモコードデータの型定義
interface Promocode {
  id: string;
  service_name: string;
  code: string;
  discount: string;
  description: string;
  category_slug: string;
  uses: number;
  created_at: string;
  expires_at?: string;
}

interface PromocodePageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PromocodePage(props: PromocodePageProps) {
  const resolvedParams = await props.params;
  const resolvedSearchParams = await props.searchParams; 

  const id = resolvedParams.id;

  const { data: promocode, error } = await supabase
    .from('promocodes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching promocode:', error.message);
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">エラーが発生しました</h1>
        <p className="text-lg text-gray-600 mb-8">データの取得に失敗しました: {error.message}</p>
        <Link href="/" legacyBehavior>
          <a className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            ホームに戻る
          </a>
        </Link>
      </div>
    );
  }

  if (!promocode) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">プロモコードが見つかりません</h1>
        <p className="text-lg text-gray-600 mb-8">お探しのプロモコードは存在しないようです。</p>
        <Link href="/" legacyBehavior>
          <a className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            ホームに戻る
          </a>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6 sm:p-8">
        {/* クライアントコンポーネントを子としてレンダリングし、データを渡す */}
        <AdAndCodeDisplay promocode={promocode} />

        {/* 関連カテゴリへのリンクは AdAndCodeDisplay.tsx に移動したので削除 */}
        {/* <div className="mt-10 text-center">
          <Link href={`/category/${promocode.category_slug}`} legacyBehavior>
            <a className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
              {promocode.service_name}の他のプロモコードを見る
            </a>
          </Link>
        </div> */}
      </div>
    </div>
  );
}