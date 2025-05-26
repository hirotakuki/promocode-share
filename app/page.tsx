import Link from 'next/link';
import { CATEGORIES } from '@/constants/categories'; // 新しく作成したファイル

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-8 text-center leading-tight">
        お得なプロモコードを<br className="sm:hidden"/>見つけよう
      </h1>
      <p className="text-xl text-gray-700 mb-12 text-center max-w-2xl">
        様々なカテゴリの最新プロモコードを簡単に見つけて、お得にショッピングやサービスを利用しましょう。
      </p>

      <div className="w-full max-w-6xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">カテゴリから探す</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((category) => (
            <Link key={category.slug} href={`/category/${category.slug}`} legacyBehavior>
              <a className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 p-6 text-center">
                <h3 className="text-xl font-semibold text-indigo-700 mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm">
                  {/* 各カテゴリの簡単な説明を追加しても良い */}
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