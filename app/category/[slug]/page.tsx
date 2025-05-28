// C:\promocode-share\app\category\[slug]\page.tsx

// 'use client'; は削除

import { supabase } from '@/lib/supabase';
import { CATEGORIES } from '@/constants/categories';
import Link from 'next/link';
import CopyButton from '../../components/copyButton';

const ITEMS_PER_PAGE = 9;

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
  expires_at?: string; // 有効期限を追加 (optional)
}

interface CategoryPageProps {
  // paramsとsearchParamsはPromise型として渡されることを想定（Next.js 15の特定の挙動に合わせる）
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ page?: string }>;
}

export default async function CategoryPage(props: CategoryPageProps) {
  // params と searchParams が Promise 型なので、await で解決する
  // このawaitは、Next.js 15のAsync Request APIの挙動に準拠しています。
  const resolvedParams = await props.params;
  // searchParams は `props` の中の `searchParams` プロパティなので、`props` が解決された後アクセスします。
  // `props.then(p => p.searchParams)` のように書くと、`props` 自体がPromiseの場合に正しいですが、
  // PagePropsの型定義としては `searchParams?: Promise<...>` としているので、ここでは `await props.searchParams` が
  // 型定義に合致します。もしエラーが出る場合は、前回の `props.then(...)` を試してください。
  const resolvedSearchParams = await props.searchParams;

  const slug = resolvedParams.slug;
  const currentPage = Number(resolvedSearchParams?.page) || 1;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentCategory = CATEGORIES.find(cat => cat.slug === slug);
  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">カテゴリが見つかりません</h1>
        <p className="text-lg text-gray-600 mb-8">お探しのカテゴリは存在しないようです。</p>
        <Link href="/" legacyBehavior>
          <a className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            ホームに戻る
          </a>
        </Link>
      </div>
    );
  }

  const { data: promocodes, count, error } = await supabase
    .from('promocodes')
    .select('*', { count: 'exact' })
    .eq('category_slug', slug)
    .order('created_at', { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">エラーが発生しました</h1>
        <p className="text-lg text-gray-600 mb-8">データの取得に失敗しました: {error.message}</p>
      </div>
    );
  }

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
          「{currentCategory.name}」のプロモコード
        </h1>

        {promocodes && promocodes.length > 0 ? (
          <>
            {/* モバイルで2〜3列表示、PCで3列表示 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {promocodes.map((promo: Promocode) => (
                <div key={promo.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:scale-105">
                  <div className="p-4 sm:p-6"> {/* パディングをモバイル向けに調整 */}
                    <p className="text-sm font-semibold text-gray-500 mb-1">{promo.service_name}</p>
                    <h2
                      className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      {promo.code} <CopyButton code={promo.code} />
                    </h2>
                    <p className="text-indigo-600 font-semibold mb-3">{promo.discount}</p>
                    {/* 説明文を表示 */}
                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">{promo.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      {/* 利用回数を削除し、有効期限があれば表示 */}
                      {promo.expires_at && (
                        <p className="text-sm text-gray-600">
                          有効期限: <span className="font-bold text-red-500">{new Date(promo.expires_at).toLocaleDateString()}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex justify-center items-center space-x-2">
              {currentPage > 1 && (
                <Link href={`/category/${slug}?page=${currentPage - 1}`} legacyBehavior>
                  <a className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    前へ
                  </a>
                </Link>
              )}
              {/* ページネーションリンク */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Link key={page} href={`/category/${slug}?page=${page}`} legacyBehavior>
                  <a
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      page === currentPage
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </a>
                </Link>
              ))}
              {currentPage < totalPages && (
                <Link href={`/category/${slug}?page=${currentPage + 1}`} legacyBehavior>
                  <a className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    次へ
                  </a>
                </Link>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-xl text-gray-600">このカテゴリにはまだプロモコードがありません。</p>
            <p className="text-md text-gray-500 mt-2">新しいプロモコードの投稿をお待ちしております！</p>
          </div>
        )}
      </div>
    </div>
  );
}