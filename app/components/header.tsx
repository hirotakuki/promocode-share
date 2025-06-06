// C:\promocode-share\app\components\header.tsx

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { CATEGORIES, Category } from '@/constants/categories';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Import Image component for optimized images

export default function Header() {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      setLoadingUser(false);
    });

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
    setIsMobileMenuOpen(false);
  };

  const handleCategoryDropdownToggle = () => {
    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsCategoryDropdownOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-indigo-700 to-purple-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">

        {/* Site Title with Logo on Left */}
        <Link href="/" legacyBehavior>
          <a className="flex items-center hover:opacity-90 transition-opacity">
            {/* Logo Image */}
            <Image
              src="/promocode-share-logo.png" // **IMPORTANT: Verify this path to your logo image**
              alt="Promocode Share Logo"
              width={32} // Adjust logo width as needed
              height={32} // Adjust logo height as needed
              className="mr-2" // Add some margin to the right of the logo
            />
            {/* Site Title Text */}
            <span className="text-2xl sm:text-3xl font-bold text-white">
              Promocode Share
            </span>
          </a>
        </Link>

        {/* PCメニュー */}
        <nav className="hidden md:flex items-center space-x-6">
          <div
            className="relative"
            onMouseEnter={() => setIsCategoryDropdownOpen(true)}
            onMouseLeave={() => setIsCategoryDropdownOpen(false)}
          >
            <button
              onClick={handleCategoryDropdownToggle}
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
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
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

          {!loadingUser && (
            <>
              {user ? (
                <>
                  {user.user_metadata?.is_admin === true && (
                    <Link href="/admin" legacyBehavior>
                      <a className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 shadow-md">
                        管理
                      </a>
                    </Link>
                  )}
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

        {/* モバイル用メニューアイコン */}
        <div className="md:hidden flex items-center">
          <button
            onClick={handleMobileMenuToggle}
            className="text-white focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* モバイル用メニュー */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-indigo-800 pb-4 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <div className="relative w-full">
              <button
                onClick={handleCategoryDropdownToggle}
                className="block w-full text-left text-white hover:bg-indigo-700 py-2 px-3 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300"
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
                <div className="mt-1 bg-indigo-700 rounded-md shadow-lg py-1 z-10">
                  {CATEGORIES.map((cat: Category) => (
                    <Link key={cat.slug} href={`/category/${cat.slug}`} legacyBehavior>
                      <a
                        className="block px-4 py-2 text-white hover:bg-indigo-600 transition-colors duration-150"
                        onClick={closeMobileMenu}
                      >
                        {cat.name}
                      </a>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {!loadingUser && (
              <>
                {user ? (
                  <>
                    {user.user_metadata?.is_admin === true && (
                      <Link href="/admin" legacyBehavior>
                        <a className="block bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md text-center" onClick={closeMobileMenu}>
                          管理
                        </a>
                      </Link>
                    )}
                    <Link href="/my-promocodes" legacyBehavior>
                      <a className="block bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md text-center" onClick={closeMobileMenu}>
                        自分の投稿
                      </a>
                    </Link>
                    <Link href="/submit-promocode" legacyBehavior>
                      <a className="block bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md text-center" onClick={closeMobileMenu}>
                        プロモコードを投稿
                      </a>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md text-center"
                    >
                      ログアウト
                    </button>
                  </>
                ) : (
                  <Link href="/login" legacyBehavior>
                    <a className="block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 shadow-md text-center" onClick={closeMobileMenu}>
                      ログイン
                    </a>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}