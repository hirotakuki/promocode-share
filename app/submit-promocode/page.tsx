// C:\promocode-share\app\submit-promocode\page.tsx

'use client';

import { useState, useEffect } from 'react'; // useEffectを追加
import { supabase } from '@/lib/supabase';
import { CATEGORIES } from '@/constants/categories';
import { useRouter } from 'next/navigation'; // useRouterをインポート

export default function SubmitPromocodePage() {
  const [serviceName, setServiceName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discount, setDiscount] = useState('');
  const [category, setCategory] = useState(''); // 選択されたカテゴリ名（display name）
  const [loading, setLoading] = useState(true); // 初期ロード状態を追加
  const [expiryDate, setExpiryDate] = useState(''); 
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // ログイン状態のチェック
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!session) {
        // ログインしていない場合、ログインページへリダイレクト
        router.push('/login');
      } else {
        setLoading(false); // ログイン済みならロード完了
      }
    };
    checkUser();

    // カテゴリの初期選択状態を設定
    if (CATEGORIES.length > 0) {
      setCategory(CATEGORIES[0].name);
    }
  }, [router]); // router を依存配列に追加

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitError(null);
  setSubmitSuccess(false);

  // URL を含む文字列を検出する簡単な正規表現
  const urlRegex = /(https?:\/\/|www\.)[^\s/$.?#].[^\s]*/i;
  if (urlRegex.test(description)) {
    setSubmitError('説明にウェブサイトのリンクを含めることはできません。');
    return;
  }

    // ログインユーザーのIDを取得
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSubmitError('ログインしていません。投稿するにはログインが必要です。');
      return;
    }

    const selectedCategorySlug = CATEGORIES.find(cat => cat.name === category)?.slug;

    if (!selectedCategorySlug) {
      setSubmitError('有効なカテゴリを選択してください。');
      return;
    }

    const { data, error } = await supabase
      .from('promocodes')
      .insert([
        {
          service_name: serviceName,
          code,
          description,
          discount,
          category_slug: selectedCategorySlug,
          user_id: user.id, // 投稿者の user_id を保存
        },
      ]);

    if (error) {
      console.error('プロモコードの投稿に失敗しました:', error);
      setSubmitError(`プロモコードの投稿に失敗しました: ${error.message}`);
    } else {
      setSubmitSuccess(true);
      setServiceName('');
      setCode('');
      setDescription('');
      setDiscount('');
      setCategory(CATEGORIES[0].name); // フォームをリセット
    }
  };

  if (loading) {
    // ログイン状態確認中のローディング表示
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-lg text-gray-600">認証情報を確認中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
          プロモコードを投稿
        </h2>

        {submitSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">成功!</strong>
            <span className="block sm:inline"> プロモコードが正常に投稿されました。</span>
          </div>
        )}

        {submitError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">エラー!</strong>
            <span className="block sm:inline"> {submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="service-name" className="block text-sm font-medium text-gray-700">
              サービス名
            </label>
            <input
              type="text"
              id="service-name"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              プロモコード
            </label>
            <input
              type="text"
              id="code"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="discount" className="block text-sm font-medium text-gray-700">
              割引内容 (例: 20%OFF, 1000円引き)
            </label>
            <input
              type="text"
              id="discount"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              required
            />
          </div>

          <div>
             <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              利用期限 (オプション)
               </label>
            <input
            type="date"
            id="expiry-date"
            className="..."
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            />
            </div>
            
            <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              詳細 (利用条件など)
            </label>
            <textarea
              id="description"
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              カテゴリ
            </label>
            <select
              id="category"
              name="category"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              投稿する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}