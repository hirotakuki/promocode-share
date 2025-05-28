// C:\promocode-share\app\page.tsx

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
        {/* ここを修正: grid-cols-1 を xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 に変更 */}
        {/* xs: は Tailwind CSS のデフォルトのモバイルブレークポイント (0px) に対応するカスタムブレークポイントを想定。
            もし Tailwind CSS の設定で xs がない場合は、grid-cols-2 (モバイルのデフォルト) と sm:grid-cols-3 から始めるのが一般的です。
            ここでは、モバイルで確実に2列表示にするために、あえて xs:grid-cols-2 とします。*/}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((category) => (
            <Link key={category.slug} href={`/category/${category.slug}`} legacyBehavior>
              <a className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 p-4 sm:p-6 text-center">
                <h3 className="text-lg sm:text-xl font-semibold text-indigo-700 mb-1 sm:mb-2">{category.name}</h3>
                {/* ここを修正: モバイルで説明文を非表示にする */}
                {/* 'hidden xs:block' または 'hidden sm:block' を使用して、モバイルでは非表示にする */}
                {/* `hidden` はデフォルトで非表示、`sm:block` は `sm` (640px) 以上で表示を意味します。
                    もしスマートフォンで確実に非表示にしたいなら、`hidden` のみで、説明文を完全に無くすか、
                    または sm:grid-cols-2 が適用されるより小さい画面サイズで隠すために `hidden sm:block` を使用します。
                    今回は「モバイル版では表示せず」なので `hidden sm:block` が適切でしょう。*/}
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