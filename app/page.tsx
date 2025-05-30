// C:\promocode-share\app\page.tsx

import Link from 'next/link';
import { CATEGORIES } from '@/constants/categories';
import { supabase } from '@/lib/supabase';
import Header from '@/app/components/header'; // Import the Header component

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

export default async function HomePage() {
  const { data: recentPromocodes, error } = await supabase
    .from('promocodes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4);

  if (error) {
    console.error('Error fetching recent promocodes:', error.message);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Include the Header component here */}
      <Header />

      <h1 className="text-5xl font-extrabold text-gray-900 mb-8 text-center leading-tight">
        紹介コードで、<br className="sm:hidden"/>おトクをシェアしよう！
      </h1>
      <p className="text-lg sm:text-xl text-gray-700 mb-12 text-center max-w-2xl">
        「使った人も、紹介した人も、みんなが嬉しい」あなたもコードをシェアして、新しい割引を見つけませんか？
      </p>

      {/* 最新のプロモコードセクション */}
      {recentPromocodes && recentPromocodes.length > 0 && (
        <section className="w-full max-w-6xl mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">新着プロモコード</h2>
          <div className="flex flex-row overflow-x-auto lg:grid lg:grid-cols-4 lg:gap-6 pb-4">
            {recentPromocodes.map((promo: Promocode) => (
              <div
                key={promo.id}
                className="flex-none w-72 sm:w-80 md:w-96 lg:w-auto
                          bg-white rounded-lg shadow-lg overflow-hidden
                          transition-all duration-300 hover:scale-105 mr-4 lg:mr-0"
              >
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-indigo-700 mb-2">
                    {promo.service_name}
                  </h3>
                  <p className="text-sm font-semibold text-gray-500 mb-1">
                    {promo.discount}
                  </p>
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">{promo.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <Link href={`/promocode/${promo.id}`} legacyBehavior>
                      <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                        コードを見る
                      </a>
                    </Link>
                    <p className="text-sm text-gray-600">
                      利用回数: <span className="font-bold text-indigo-700">{promo.uses || 0}</span>
                    </p>
                    {promo.expires_at && (
                      <p className="text-sm text-gray-600 ml-auto">
                        期限: <span className="font-bold text-red-500">{new Date(promo.expires_at).toLocaleDateString()}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 以下、既存のカテゴリセクションと投稿ボタン */}
      <div className="w-full max-w-6xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">カテゴリから探す</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((category) => (
            <Link key={category.slug} href={`/category/${category.slug}`} legacyBehavior>
              <a className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 p-4 sm:p-6 text-center">
                <h3 className="text-lg sm:text-xl font-semibold text-indigo-700 mb-1 sm:mb-2">{category.name}</h3>
                <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
                  {category.name}関連のプロモコード
                </p>
              </a>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">プロモコードを共有しませんか？</h2>
        <p className="text-lg text-gray-700 mb-6">
          あなたが知っているお得なプロモコードを投稿して、みんなに共有しましょう！
        </p>
        <Link href="/submit-promocode" legacyBehavior>
          <a className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300">
            プロモコードを投稿する
          </a>
        </Link>
      </div>
    </div>
  );
}