// C:\promocode-share\app\category\[slug]\page.tsx

'use client';

import { supabase } from '@/lib/supabase';
import { CATEGORIES } from '@/constants/categories';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const ITEMS_PER_PAGE = 9;

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams?: {
    page?: string;
  };
}

export default function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = params;
  const currentPage = Number(searchParams?.page) || 1;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentCategory = CATEGORIES.find(cat => cat.slug === slug);
  const categoryName = currentCategory ? currentCategory.name : '未知のカテゴリ';

  const [promocodes, setPromocodes] = useState<any[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromocodes = async () => {
    setLoading(true);
    setError(null);
    if (!currentCategory) {
      setError('カテゴリが見つかりません');
      setLoading(false);
      return;
    }

    try {
      const { data, count: totalCount, error } = await supabase
        .from('promocodes')
        .select('*', { count: 'exact' })
        .eq('category_slug', slug)
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      if (error) {
        throw error;
      }
      setPromocodes(data || []);
      setCount(totalCount || 0);
    } catch (err: any) {
      console.error('Error fetching promocodes:', err);
      setError(`データの取得に失敗しました: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromocodes();
  }, [currentPage, slug, currentCategory]);

  // ★プロモコードコピーボタンのハンドラーに変更★
  const handleCopyPromocode = async (codeToCopy: string) => {
    try {
      await navigator.clipboard.writeText(codeToCopy);
      alert('プロモコードをコピーしました！');
      // ★利用回数も更新する場合（オプション）★
      // コピーと利用回数更新を紐づける場合は、ここでusesを更新するロジックを追加
      // 例:
      // const { error: updateError } = await supabase
      //   .from('promocodes')
      //   .update({ uses: (promo.uses || 0) + 1 })
      //   .eq('id', promo.id);
      // if (updateError) throw updateError;
      // setPromocodes(prevPromocodes =>
      //   prevPromocodes.map(promo =>
      //     promo.code === codeToCopy ? { ...promo, uses: (promo.uses || 0) + 1 } : promo
      //   )
      // );

    } catch (err) {
      console.error('プロモコードのコピーに失敗しました:', err);
      alert('プロモコードのコピーに失敗しました。');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-lg text-gray-600">データを読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">エラーが発生しました</h1>
        <p className="text-lg text-gray-600 mb-8">{error}</p>
        <button
          onClick={fetchPromocodes}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          再試行
        </button>
      </div>
    );
  }

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

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 0;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
          「{categoryName}」のプロモコード
        </h1>

        {promocodes && promocodes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promocodes.map((promo) => (
                <div key={promo.id} className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:scale-105">
                  <div className="p-6">
                    <p className="text-sm font-semibold text-gray-500 mb-1">{promo.service_name}</p>
                    {/* プロモコードをクリックでコピーできるようにする */}
                    <h2 
                      className="text-2xl font-bold text-gray-800 mb-2 cursor-pointer hover:text-indigo-600 transition-colors"
                      onClick={() => handleCopyPromocode(promo.code)} // クリックでコピー
                    >
                      {promo.code}
                    </h2>
                    <p className="text-indigo-600 font-semibold mb-3">{promo.discount}</p>
                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">{promo.description}</p>
                    
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-gray-600">
                        利用回数: <span className="font-bold text-indigo-700">{promo.uses || 0}</span>
                      </p>
                      {/* ★コピーボタンに変更★ */}
                      <button
                        onClick={() => handleCopyPromocode(promo.code)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                      >
                        コピー
                      </button>
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