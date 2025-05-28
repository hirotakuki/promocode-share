// C:\promocode-share\app\components\Header.tsx

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { CATEGORIES, Category } from '@/constants/categories';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // ユーザーセッションの監視
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      setLoadingUser(false);
    });

    // 初回ロード時に現在のセッションを取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoadingUser(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    setLoadingUser(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('ログアウトエラー:', error.message);
      alert('ログアウトに失敗しました。');
    } else {
      setUser(null);
      router.push('/');
    }
    setLoadingUser(false);
  };

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
                onMouseEnter={() => setIsCategoryDropdownOpen(true)}
                onMouseLeave={() => setIsCategoryDropdownOpen(false)}
                className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
              >
                {CATEGORIES.map((cat: Category) => (
                  <Link key={cat.slug} href={`/category/${cat.slug}`} legacyBehavior>
                    <a
                      className="block px-4 py-2 text-gray-800 hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-150"
                      onClick={() => setIsCategoryDropdownOpen(false)}
                    >
                      {cat.name}
                    </a>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* ログイン状態に応じたリンク */}
          {!loadingUser && (
            <>
              {user ? (
                <>
                  {/* 管理者のみに表示されるリンク */}
                  {user.user_metadata?.is_admin === true && (
                    <Link href="/admin" legacyBehavior>
                      <a className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 shadow-md">
                        管理
                      </a>
                    </Link>
                  )}
                  {/* ★ここから追加・修正します★ */}
                  {/* 自分の投稿ページへのリンク */}
                  <Link href="/my-promocodes" legacyBehavior>
                    <a className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 shadow-md">
                      自分の投稿
                    </a>
                  </Link>
                  <Link href="/submit-promocode" legacyBehavior>
                    <a className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 shadow-md">
                      プロモコードを投稿
                    </a>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 shadow-md"
                  >
                    ログアウト
                  </button>
                </>
              ) : (
                <Link href="/login" legacyBehavior>
                  <a className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 shadow-md">
                    ログイン
                  </a>
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}