// C:\promocode-share\app\my-promocodes\page.tsx

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CATEGORIES } from '@/constants/categories'; // カテゴリ表示のため

// プロモコードの型定義を更新
interface Promocode {
  id: string;
  service_name: string;
  code: string;
  description: string;
  discount: string;
  category_slug: string;
  created_at: string;
  user_id: string;
  expiry_date: string | null; // expiry_date も編集対象なので含める
}

export default function MyPromocodesPage() {
  const [myPromocodes, setMyPromocodes] = useState<Promocode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // --- 編集モーダル関連のstate ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPromocode, setEditingPromocode] = useState<Promocode | null>(null);
  const [editServiceName, setEditServiceName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDiscount, setEditDiscount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState<string | null>(null); // YYYY-MM-DD 形式

  const [editSubmitError, setEditSubmitError] = useState<string | null>(null);
  const [editSubmitSuccess, setEditSubmitSuccess] = useState(false);
  // --- 編集モーダル関連のstate ここまで ---

  useEffect(() => {
    const fetchMyPromocodes = async () => {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session || !session.user) {
        setError('ログインしていません。');
        router.push('/login'); // ログインページへリダイレクト
        return;
      }

      try {
        const user = session.user;
        const { data, error: fetchError } = await supabase
          .from('promocodes')
          .select('*') // 全てのカラムを取得
          .eq('user_id', user.id) // ユーザーIDでフィルタリング
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }
        setMyPromocodes(data || []);
      } catch (err: any) {
        console.error('自分のプロモコードの取得に失敗しました:', err);
        setError(`自分のプロモコードの取得に失敗しました: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPromocodes();
  }, [router]);

  const handleDeletePromocode = async (id: string, serviceName: string) => {
    if (!confirm(`${serviceName} のプロモコードを本当に削除しますか？`)) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('promocodes')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      setMyPromocodes(prevPromocodes => prevPromocodes.filter(promo => promo.id !== id));
      alert('プロモコードが正常に削除されました。');
    } catch (err: any) {
      console.error('プロモコードの削除に失敗しました:', err);
      alert(`プロモコードの削除に失敗しました: ${err.message}`);
    }
  };

  // --- 編集モーダル関連の関数 ---
  const handleEditClick = (promo: Promocode) => {
    setEditingPromocode(promo);
    setEditServiceName(promo.service_name);
    setEditCode(promo.code);
    setEditDescription(promo.description);
    setEditDiscount(promo.discount);
    setEditCategory(CATEGORIES.find(cat => cat.slug === promo.category_slug)?.name || promo.category_slug); // カテゴリスラッグから名前に変換
    setEditExpiryDate(promo.expiry_date); // YYYY-MM-DD 形式
    setIsEditModalOpen(true);
    setEditSubmitError(null);
    setEditSubmitSuccess(false);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingPromocode(null);
    setEditSubmitError(null);
    setEditSubmitSuccess(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromocode) return;

    setEditSubmitError(null);
    setEditSubmitSuccess(false);

    const urlRegex = /(https?:\/\/|www\.)[^\s/$.?#].[^\s]*/i;
    if (urlRegex.test(editDescription)) {
      setEditSubmitError('説明にウェブサイトのリンクを含めることはできません。');
      return;
    }

    const selectedCategorySlug = CATEGORIES.find(cat => cat.name === editCategory)?.slug;

    if (!selectedCategorySlug) {
      setEditSubmitError('有効なカテゴリを選択してください。');
      return;
    }

    try {
      const { data, error: updateError } = await supabase
        .from('promocodes')
        .update({
          service_name: editServiceName,
          code: editCode,
          description: editDescription,
          discount: editDiscount,
          category_slug: selectedCategorySlug,
          expiry_date: editExpiryDate, // null または YYYY-MM-DD 形式の文字列
        })
        .eq('id', editingPromocode.id)
        .select(); // 更新されたデータを取得

      if (updateError) {
        throw updateError;
      }

      // 成功したら、リストを更新
      setMyPromocodes(prevPromocodes =>
        prevPromocodes.map(promo =>
          promo.id === editingPromocode.id ? (data[0] as Promocode) : promo
        )
      );
      setEditSubmitSuccess(true);
      // alert('プロモコードが正常に更新されました。'); // アラートではなくモーダル内で表示
      // handleEditModalClose(); // 自動で閉じるか、ユーザーに成功メッセージを見せるか検討
    } catch (err: any) {
      console.error('プロモコードの更新に失敗しました:', err);
      setEditSubmitError(`プロモコードの更新に失敗しました: ${err.message}`);
    }
  };
  // --- 編集モーダル関連の関数 ここまで ---

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-lg text-gray-600">プロモコードを読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">エラー</h1>
        <p className="text-lg text-gray-600 mb-8">{error}</p>
        <Link href="/" legacyBehavior>
          <a className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
            ホームに戻る
          </a>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
          自分の投稿したプロモコード
        </h1>

        {myPromocodes.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">まだプロモコードを投稿していません。</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    サービス名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    コード
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    割引
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    カテゴリ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    利用期限
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    投稿日時
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">操作</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {myPromocodes.map((promo) => (
                  <tr key={promo.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {promo.service_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {promo.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {promo.discount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {CATEGORIES.find(cat => cat.slug === promo.category_slug)?.name || promo.category_slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {promo.expiry_date ? (
                        new Date(promo.expiry_date).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      ) : (
                        '設定なし'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(promo.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(promo)} // ★編集ボタンを追加
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDeletePromocode(promo.id, promo.service_name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- 編集モーダル --- */}
      {isEditModalOpen && editingPromocode && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative p-8 bg-white w-full max-w-md mx-auto rounded-lg shadow-xl animate-fade-in-up">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">プロモコードを編集</h3>
            <button
              onClick={handleEditModalClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-3xl font-bold"
            >
              &times;
            </button>

            {editSubmitSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">成功!</strong>
                <span className="block sm:inline"> プロモコードが正常に更新されました。</span>
              </div>
            )}

            {editSubmitError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">エラー!</strong>
                <span className="block sm:inline"> {editSubmitError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label htmlFor="edit-service-name" className="block text-sm font-medium text-gray-700">
                  サービス名
                </label>
                <input
                  type="text"
                  id="edit-service-name"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={editServiceName}
                  onChange={(e) => setEditServiceName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-code" className="block text-sm font-medium text-gray-700">
                  プロモコード
                </label>
                <input
                  type="text"
                  id="edit-code"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-discount" className="block text-sm font-medium text-gray-700">
                  割引内容 (例: 20%OFF, 1000円引き)
                </label>
                <input
                  type="text"
                  id="edit-discount"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={editDiscount}
                  onChange={(e) => setEditDiscount(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-expiry-date" className="block text-sm font-medium text-gray-700">
                  利用期限 (オプション)
                </label>
                <input
                  type="date"
                  id="edit-expiry-date"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={editExpiryDate || ''} // nullの場合は空文字列を渡す
                  onChange={(e) => setEditExpiryDate(e.target.value || null)} // 空文字列ならnullに戻す
                />
              </div>

              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
                  詳細 (利用条件など)
                </label>
                <textarea
                  id="edit-description"
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              <div>
                <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700">
                  カテゴリ
                </label>
                <select
                  id="edit-category"
                  name="category"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.slug} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                更新する
              </button>
            </form>
          </div>
        </div>
      )}
      {/* --- 編集モーダル ここまで --- */}
    </div>
  );
}