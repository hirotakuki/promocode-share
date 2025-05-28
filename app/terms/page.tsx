// pages/terms.tsx
import Head from 'next/head';

export default function Terms() {
  return (
    <>
      <Head>
        <title>利用規約 | promocode-share</title>
      </Head>
      <main className="p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">利用規約</h1>
        <p className="mb-4">この利用規約（以下「本規約」といいます。）は、promocode-share（以下「当サイト」といいます。）が提供するサービスの利用条件を定めるものです。</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">第1条（適用）</h2>
        <p className="mb-4">本規約は、当サイトを利用するすべてのユーザーに適用されるものとします。</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">第2条（禁止事項）</h2>
        <p className="mb-2">ユーザーは、以下の行為をしてはなりません：</p>
        <ul className="list-disc list-inside mb-4">
          <li>虚偽の情報の投稿</li>
          <li>法令または公序良俗に違反する行為</li>
          <li>他者の権利を侵害する行為</li>
          <li>当サイトの運営を妨害する行為</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">第3条（免責事項）</h2>
        <p className="mb-4">当サイトは、投稿された情報の正確性・有効性について一切の保証をいたしません。利用者の判断と責任においてご利用ください。</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">第4条（サービスの変更等）</h2>
        <p className="mb-4">当サイトは、事前の通知なくサービスの内容を変更・停止できるものとします。</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">第5条（準拠法）</h2>
        <p className="mb-4">本規約は日本法を準拠法とし、当サイトに関する紛争については日本の裁判所を専属的合意管轄裁判所とします。</p>

        <p className="mt-8 text-sm text-gray-600">最終更新日：2025年5月28日</p>
      </main>
    </>
  );
}
