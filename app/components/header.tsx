// C:\promocode-share\app\components\Header.tsx

'use client'; // クライアントコンポーネントとしてマーク

import Link from 'next/link';
import { useState } from 'react';
import { CATEGORIES, Category } from '@/constants/categories'; // カテゴリデータをインポート

export default function Header() {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-indigo-700 to-purple-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* ホームページへのリンク（ロゴ） */}
        <Link href="/" legacyBehavior>
          <a className="text-3xl font-extrabold tracking-tight hover:opacity-90 transition-opacity">
            Promocode Share
          </a>
        </Link>

        <nav className="flex items-center space-x-6">
          {/* カテゴリー ドロップダウンメニュー */}
          <div className="relative">
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              // マウスオーバーで開く（オプション、クリックだけで良い場合はonClickのみでもOK）
              onMouseEnter={() => setIsCategoryDropdownOpen(true)} 
              onMouseLeave={() => setIsCategoryDropdownOpen(false)} 
              className="text-white hover:text-indigo-200 font-medium py-2 px-3 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300"
            >
              カテゴリー
              <svg
                className={`ml-2 h-4 w-4 inline-block transform transition-transform duration-200 ${
                  isCategoryDropdownOpen ? 'rotate-180' : 'rotate-0'
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isCategoryDropdownOpen && (
              <div
                // ドロップダウン内でのマウスオーバーで開いたままにする
                onMouseEnter={() => setIsCategoryDropdownOpen(true)} 
                // ドロップダウンから離れたら閉じる
                onMouseLeave={() => setIsCategoryDropdownOpen(false)} 
                className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
              >
                {CATEGORIES.map((cat: Category) => (
                  <Link key={cat.slug} href={`/category/${cat.slug}`} legacyBehavior>
                    <a
                      className="block px-4 py-2 text-gray-800 hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-150"
                      onClick={() => setIsCategoryDropdownOpen(false)} // クリックで閉じる
                    >
                      {cat.name}
                    </a>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 投稿ページへのリンク */}
          <Link href="/submit-promocode" legacyBehavior>
            <a className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 shadow-md">
              プロモコードを投稿
            </a>
          </Link>
        </nav>
      </div>
    </header>
  );
}