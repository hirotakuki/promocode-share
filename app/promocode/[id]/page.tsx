// C:\promocode-share\app\promocode\[id]\page.tsx

import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import type { Metadata } from 'next'; // Metadata型をインポート
// notFound は元のスクリプトにはありませんでしたが、
// 以前のやり取りでの提案に基づいて、ページコンポーネントのロジックに合わせるため保持します。
// ただし、generateMetadata関数からは呼び出しません。
import { notFound } from 'next/navigation'; 
import AdAndCodeDisplay from '@/app/components/AdAndCodeDisplay'; // パスを修正済み
import { CATEGORIES } from '@/constants/categories'; // カテゴリ名解決のためにインポート

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

// プロモコードを取得する非同期関数
async function getPromocode(id: string): Promise<Promocode | null> {
  const { data, error } = await supabase
    .from('promocodes')
    .select('*')
    .eq('id', id)
    .single(); // 単一の結果を期待

  if (error || !data) {
    console.error('Error fetching promocode:', error?.message);
    return null;
  }
  return data;
}

// ここにgenerateMetadata関数を追加
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params; // Promiseを解決
  const promocode = await getPromocode(resolvedParams.id);

  if (!promocode) {
    // プロモコードが見つからない場合でもメタデータは返す
    return {
      title: 'プロモコードが見つかりません | Promocode Share',
      description: 'お探しのプロモコードは見つかりませんでした。',
    };
  }

  const categoryName = CATEGORIES.find(cat => cat.slug === promocode.category_slug)?.name || '未分類';

  const title = `${promocode.service_name}のプロモコード・クーポン (${promocode.discount}) | ${categoryName} | Promocode Share`;
  const description = `${promocode.service_name}の${promocode.discount}割引プロモコード「${promocode.code}」をゲット！${promocode.description}。${categoryName}カテゴリの最新お得情報をPromocode Shareでチェック！`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      // images: ['/your-og-image.jpg'], // OGP画像があれば設定
      url: `https://your-domain.com/promocode/${promocode.id}`, // あなたのサイトの実際のURLに置き換える
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image', // または 'summary'
      title,
      description,
      // images: ['/your-og-image.jpg'],
    },
  };
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
      </div>
    </div>
  );
}