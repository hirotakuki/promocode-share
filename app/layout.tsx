// C:\promocode-share\app\layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // グローバルCSSのインポート

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  // タイトルをより具体的でSEOフレンドリーなものに変更
  title: 'Promocode Share | お得な紹介コード・クーポンをシェアしよう',
  // ディスクリプションを、検索流入を意識した魅力的な説明に変更
  description: '使って嬉しい、シェアして嬉しい！最新のプロモコードや紹介コードで賢くお買い物を楽しもう。カテゴリー別に探せるお得な情報満載のプラットフォーム。',
};

// Headerコンポーネントをインポートします
import Header from './components/header';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        {/* Headerコンポーネントをレンダリング */}
        <Header />

        {/* 各ページコンテンツがここに表示されます */}
        <main>{children}</main>

        {/* フッター */}
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