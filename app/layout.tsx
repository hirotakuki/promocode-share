// C:\promocode-share\app\layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // グローバルCSSのインポート
import Link from 'next/link'; // Linkコンポーネントをインポート

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  // タイトルをより具体的でSEOフレンドリーなものに変更
  title: 'Promocode Share | お得な紹介コード・クーポンをシェアしよう',
  // ディスクリプションを、検索流入を意識した魅力的な説明に変更
  description: '使って嬉しい、シェアして嬉しい！最新のプロモコードや紹介コードで賢くお買い物を楽しもう。カテゴリー別に探せるお得な情報満載のプラットフォーム。',
};

// Headerコンポーネントをインポートします
import Header from './components/header';
// ContactFormのインポートは不要になります
// import ContactForm from './components/ContactForm';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className + " flex flex-col min-h-screen"}> {/* 最小の高さを設定してフッターを一番下に固定 */}
        {/* Headerコンポーネントをレンダリング */}
        <Header />

        {/* 各ページコンテンツがここに表示されます */}
        <main className="flex-grow">{children}</main> {/* mainタグが残りのスペースを占めるように設定 */}

        {/* フッター */}
        <footer className="bg-gray-800 text-white p-6 mt-10">
          <div className="max-w-7xl mx-auto">
            {/* お問い合わせフォームの代わりにリンクを追加 */}
            <div className="text-center mb-6"> {/* フッターリンクセクションを中央寄せに調整 */}
              <nav className="flex justify-center space-x-6">
                <Link href="/privacy" className="hover:underline">
                  プライバシーポリシー
                </Link>
                <Link href="/terms" className="hover:underline">
                  利用規約
                </Link>
                <Link href="/contact" className="hover:underline"> {/* 新しいお問い合わせページへのリンク */}
                  お問い合わせ
                </Link>
              </nav>
            </div>

            <div className="border-t border-gray-700 pt-6 text-center">
              <p>&copy; {new Date().getFullYear()} Promocode Share. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}