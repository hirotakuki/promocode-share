// app/category/[slug]/page.tsx

import { supabase } from '@/lib/supabase';
import { CATEGORIES } from '@/constants/categories';
import Link from 'next/link';
import CopyButton from '../../components/copyButton';

const ITEMS_PER_PAGE = 9;

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams?: {
    page?: string;
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = params;
  const currentPage = Number(searchParams?.page) || 1;
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promocodes.map((promo) => (
                <div key={promo.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:scale-105">
                  <div className="p-6">
                    <p className="text-sm font-semibold text-gray-500 mb-1">{promo.service_name}</p>
                    <h2
                      className="text-2xl font-bold text-gray-800 mb-2 cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      {promo.code} <CopyButton code={promo.code} />
                    </h2>
                    <p className="text-indigo-600 font-semibold mb-3">{promo.discount}</p>
                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">{promo.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-gray-600">
                        利用回数: <span className="font-bold text-indigo-700">{promo.uses || 0}</span>
                      </p>
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
