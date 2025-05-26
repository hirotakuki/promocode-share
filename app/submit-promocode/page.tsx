// C:\promocode-share\app\submit-promocode\page.tsx

'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CATEGORIES, Category } from '@/constants/categories';
import { useRouter } from 'next/navigation';

export default function SubmitPromocodePage() {
  // ① サービス名用の新しいstateを追加
  const [serviceName, setServiceName] = useState(''); // ★追加
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discount, setDiscount] = useState('');
  // ② affiliateLink のstateを削除またはコメントアウト
  // const [affiliateLink, setAffiliateLink] = useState(''); // ★削除またはコメントアウト
  const [category, setCategory] = useState<string>(CATEGORIES[0].name);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // ③ バリデーションにserviceNameを追加
    if (!serviceName || !code || !description || !discount || !category) { // ★修正
      setMessage('必須項目をすべて入力してください。');
      setLoading(false);
      return;
    }

    try {
      const selectedCategorySlug = CATEGORIES.find(cat => cat.name === category)?.slug || 'other';

      const { data, error } = await supabase
        .from('promocodes')
        .insert([
          {
            // ④ service_name カラムに serviceName を渡す
            service_name: serviceName, // ★追加
            code,
            description,
            discount,
            // ⑤ affiliate_link は送信しないか、null を固定で渡す
            // affiliate_link: affiliateLink || null, // ★削除またはコメントアウト
            category_slug: selectedCategorySlug,
          },
        ]);

      if (error) {
        throw error;
      }

      setMessage('プロモコードが正常に投稿されました！');
      // ⑥ フォームのリセットにserviceNameを追加、affiliateLinkを削除
      setServiceName(''); // ★追加
      setCode('');
      setDescription('');
      setDiscount('');
      // setAffiliateLink(''); // ★削除またはコメントアウト
      setCategory(CATEGORIES[0].name);

      router.push(`/category/${selectedCategorySlug}`);

    } catch (err: any) {
      console.error('プロモコード投稿エラー:', err);
      setMessage(`プロモコードの投稿に失敗しました: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 flex justify-center items-center">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          プロモコードを投稿する
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ⑦ サービス名入力フィールドを一番上に追加 */}
          <div> {/* ★追加 */}
            <label htmlFor="serviceName" className="block text-gray-700 text-sm font-bold mb-2">
              サービス名 (必須)
            </label>
            <input
              type="text"
              id="serviceName"
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: Netflix, Amazon, ユニクロ"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="code" className="block text-gray-700 text-sm font-bold mb-2">
              プロモコード (必須)
            </label>
            <input
              type="text"
              id="code"
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: SUMMER20"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
              説明 (必須)
            </label>
            <textarea
              id="description"
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 h-28"
              placeholder="例: このコードでオンラインストアの全商品が20%オフになります。"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="discount" className="block text-gray-700 text-sm font-bold mb-2">
              割引率/内容 (必須)
            </label>
            <input
              type="text"
              id="discount"
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 20% OFF / ¥500 OFF"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
              カテゴリー (必須)
            </label>
            <select
              id="category"
              className="shadow border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {CATEGORIES.map((cat: Category) => (
                <option key={cat.slug} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* ⑧ アフィリエイトリンクのフィールドを削除またはコメントアウト */}
          {/*
          <div>
            <label htmlFor="affiliateLink" className="block text-gray-700 text-sm font-bold mb-2">
              アフィリエイトリンク (任意)
            </label>
            <input
              type="url"
              id="affiliateLink"
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: https://example.com/affiliate-link"
              value={affiliateLink}
              onChange={(e) => setAffiliateLink(e.target.value)}
            />
            <p className="text-sm text-gray-500 mt-1">※ 関連するアフィリエイトリンクがあれば入力してください</p>
          </div>
          */}

          {message && (
            <p className={`text-center py-2 rounded ${message.includes('成功') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-colors duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? '投稿中...' : 'プロモコードを投稿'}
          </button>
        </form>
      </div>
    </div>
  );
}