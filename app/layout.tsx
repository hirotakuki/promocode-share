// C:\promocode-share\app\layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // グローバルCSSのインポート

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Promocode Share', // タイトルは「プロモコードシェア」でもOK
  description: 'みんなでプロモコードを共有するプラットフォーム',
};

// Headerコンポーネントをインポートします
import Header from './components/header'; // ★ここを追加★

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        {/* ★ここから既存のheaderタグを削除し、Headerコンポーネントに置き換えます★ */}
        <Header /> {/* 新しいHeaderコンポーネントをレンダリング */}
        {/* ★ここまでを置き換えます★ */}

        <main>{children}</main> {/* mainタグは残しておくと良いでしょう */}

        {/* フッターはそのまま残します */}
        <footer className="bg-gray-800 text-white p-6 text-center mt-10">
          <div className="max-w-7xl mx-auto">
            <p>&copy; {new Date().getFullYear()} Promocode Share. All rights reserved.</p>
            <p className="text-sm mt-2">
              <a href="/privacy" className="hover:underline">プライバシーポリシー</a> |{' '}
              <a href="/terms" className="hover:underline">利用規約</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}