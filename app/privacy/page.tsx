// pages/privacy.tsx
import Head from 'next/head';

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>プライバシーポリシー | promocode-share</title>
      </Head>
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">プライバシーポリシー</h1>
        <p className="mb-4">promocode-share（以下「当サイト」といいます。）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. 取得する情報</h2>
        <p className="mb-4">当サイトでは、Supabaseアカウント連携などを通じて、メールアドレス、ユーザー名などの情報を取得する場合があります。</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. 利用目的</h2>
        <p className="mb-4">取得した情報は、サービスの提供・改善、ユーザーサポート、違反行為への対応のために利用します。</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. 第三者提供</h2>
        <p className="mb-4">法令に基づく場合を除き、ユーザーの同意なく第三者に提供することはありません。</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. アクセス解析</h2>
        <p className="mb-4">当サイトでは、サービス改善のため Google Analytics 等のアクセス解析ツールを利用する場合があります。</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. プライバシーポリシーの変更</h2>
        <p className="mb-4">本ポリシーは、必要に応じて改定することがあります。改定後は速やかに当サイト上に掲示します。</p>

        <p className="mt-8 text-sm text-gray-600">最終更新日：2025年5月28日</p>
      </main>
    </>
  );
}
