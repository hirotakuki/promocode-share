// C:\promocode-share\app\admin\page.tsx

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { CATEGORIES } from '@/constants/categories';
import Link from 'next/link';

// PromocodeWithUser インターフェースの定義
// プロモコードデータと、投稿者（profilesテーブル）の情報を結合した形
interface PromocodeWithUser extends Record<string, any> {
  id: string;
  service_name: string;
  code: string;
  description: string;
  discount: string;
  category_slug: string;
  created_at: string;
  user_id: string; // promocodes テーブルの user_id カラム
  expiry_date: string | null; // 利用期限はオプションなので string | null
  user?: { // user_id を介して結合される profiles テーブルのデータ
    email: string; // profiles テーブルに email カラムがあることを想定
  };
}

// 新しい報告インターフェース
// 報告されたプロモコードのデータ構造
interface ReportedPromocode {
  id: string;
  promocode_id: string;
  reason: string;
  created_at: string;
  status: 'pending' | 'resolved' | 'dismissed'; // 報告ステータス
  promocode?: { // 報告されたプロモコードの参照情報
    service_name: string;
    code: string;
    discount: string;
    category_slug: string;
  };
}

export default function AdminPage() {
  // プロモコード一覧のstate
  const [promocodes, setPromocodes] = useState<PromocodeWithUser[]>([]);
  // 報告されたプロモコード一覧のstate
  const [reportedPromocodes, setReportedPromocodes] = useState<ReportedPromocode[]>([]);
  // ローディング状態のstate
  const [loading, setLoading] = useState(true);
  // エラーメッセージのstate
  const [error, setError] = useState<string | null>(null);
  // Next.jsルーターのフック
  const router = useRouter();

  // --- 編集モーダル関連のstate ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // 編集モーダルの表示状態
  const [editingPromocode, setEditingPromocode] = useState<PromocodeWithUser | null>(null); // 編集中のプロモコードデータ
  const [editServiceName, setEditServiceName] = useState(''); // 編集フォーム用サービス名
  const [editCode, setEditCode] = useState(''); // 編集フォーム用コード
  const [editDescription, setEditDescription] = useState(''); // 編集フォーム用説明
  const [editDiscount, setEditDiscount] = useState(''); // 編集フォーム用割引内容
  const [editCategory, setEditCategory] = useState(''); // 編集フォーム用カテゴリ
  const [editExpiryDate, setEditExpiryDate] = useState<string | null>(null); // 編集フォーム用利用期限 (YYYY-MM-DD 形式)

  const [editSubmitError, setEditSubmitError] = useState<string | null>(null); // 編集送信時のエラーメッセージ
  const [editSubmitSuccess, setEditSubmitSuccess] = useState(false); // 編集送信時の成功メッセージ
  // --- 編集モーダル関連のstate ここまで ---

  // コンポーネントマウント時に管理者権限をチェックし、データをフェッチ
  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      setLoading(true); // ローディング開始

      // Supabaseセッションの取得
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      // セッションエラーまたは未ログインの場合
      if (sessionError || !session || !session.user) {
        setError('ログインしていません。');
        router.push('/login'); // ログインページへリダイレクト
        return;
      }

      // 管理者権限の確認
      const isAdmin = session.user.user_metadata?.is_admin === true;

      if (!isAdmin) {
        setError('管理者権限がありません。');
        router.push('/'); // ホームページへリダイレクト
        return;
      }

      try {
        // 全プロモコードと投稿者情報（profiles テーブルから）を結合して取得
        const { data: promoData, error: fetchPromoError } = await supabase
          .from('promocodes')
          .select(`
            *,
            user:profiles(email)
          `)
          .order('created_at', { ascending: false }); // 作成日時で降順ソート

        if (fetchPromoError) {
          throw fetchPromoError;
        }
        setPromocodes(promoData as unknown as PromocodeWithUser[] || []); // 取得したプロモコードをstateにセット

        // 報告されたプロモコードを取得
        const { data: reportedData, error: fetchReportedError } = await supabase
          .from('reported_promocodes')
          .select(`
            *,
            promocode:promocodes(service_name, code, discount, category_slug)
          `) // 報告されたプロモコードの詳細も結合して取得
          .eq('status', 'pending') // ステータスが 'pending' (保留中) のもののみ取得
          .order('created_at', { ascending: false }); // 作成日時で降順ソート

        if (fetchReportedError) {
          throw fetchReportedError;
        }
        setReportedPromocodes(reportedData as ReportedPromocode[] || []); // 取得した報告をstateにセット

      } catch (err: any) {
        console.error('データの取得に失敗しました:', err);
        setError(`データの取得に失敗しました: ${err.message}`);
      } finally {
        setLoading(false); // ローディング終了
      }
    };

    checkAdminAndFetchData();
  }, [router]); // routerが変更されたときに再実行

  // プロモコード削除ハンドラ
  const handleDeletePromocode = async (id: string) => {
    // ユーザーに確認メッセージを表示（alertの代わりにwindow.confirmを使用）
    if (!window.confirm('本当にこのプロモコードを削除しますか？')) {
      return;
    }

    try {
      // Supabaseからプロモコードを削除
      const { error: deleteError } = await supabase
        .from('promocodes')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      // 成功したら、stateから該当プロモコードを削除
      setPromocodes(prevPromocodes => prevPromocodes.filter(promo => promo.id !== id));
      // 削除されたプロモコードに関連する報告もリストから削除
      setReportedPromocodes(prevReports => prevReports.filter(report => report.promocode_id !== id));
      // ユーザーに成功メッセージを表示（alertの代わりにカスタムUIを使用することも可能）
      // alert('プロモコードが正常に削除されました。');
    } catch (err: any) {
      console.error('プロモコードの削除に失敗しました:', err);
      // alert(`プロモコードの削除に失敗しました: ${err.message}`);
    }
  };

  // 報告のステータスを更新する関数
  const handleUpdateReportStatus = async (reportId: string, newStatus: 'resolved' | 'dismissed') => {
    try {
      // Supabaseで報告のステータスを更新
      const { data, error: updateError } = await supabase
        .from('reported_promocodes')
        .update({ status: newStatus })
        .eq('id', reportId)
        .select(); // 更新されたデータを取得

      if (updateError) {
        throw updateError;
      }

      // 報告リストから更新された報告を削除（またはステータスを更新）
      // ここでは、ステータスが変更された報告は「pending」リストから削除されるようにフィルター
      setReportedPromocodes(prevReports => prevReports.filter(report => report.id !== reportId));
      // alert(`報告を「${newStatus === 'resolved' ? '解決済み' : '却下済み'}」にしました。`);
    } catch (err: any) {
      console.error('報告ステータスの更新に失敗しました:', err);
      // alert(`報告ステータスの更新に失敗しました: ${err.message}`);
    }
  };

  // --- 編集モーダル関連の関数 ---
  // 編集ボタンクリック時のハンドラ
  const handleEditClick = (promo: PromocodeWithUser) => {
    setEditingPromocode(promo);
    setEditServiceName(promo.service_name);
    setEditCode(promo.code);
    setEditDescription(promo.description);
    setEditDiscount(promo.discount);
    // スラッグからカテゴリ名への変換
    setEditCategory(CATEGORIES.find(cat => cat.slug === promo.category_slug)?.name || promo.category_slug);
    setEditExpiryDate(promo.expiry_date); // YYYY-MM-DD 形式
    setIsEditModalOpen(true); // モーダルを開く
    setEditSubmitError(null); // エラーメッセージをクリア
    setEditSubmitSuccess(false); // 成功メッセージをクリア
  };

  // 編集モーダルを閉じるハンドラ
  const handleEditModalClose = () => {
    setIsEditModalOpen(false); // モーダルを閉じる
    setEditingPromocode(null); // 編集中のプロモコードをクリア
    setEditSubmitError(null); // エラーメッセージをクリア
    setEditSubmitSuccess(false); // 成功メッセージをクリア
  };

  // 編集フォーム送信ハンドラ
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromocode) return; // 編集中のプロモコードがない場合は何もしない

    setEditSubmitError(null); // エラーメッセージをクリア
    setEditSubmitSuccess(false); // 成功メッセージをクリア

    // 説明文にURLが含まれていないかチェック
    const urlRegex = /(https?:\/\/|www\.)[^\s/$.?#].[^\s]*/i;
    if (urlRegex.test(editDescription)) {
      setEditSubmitError('説明にウェブサイトのリンクを含めることはできません。');
      return;
    }

    // 選択されたカテゴリ名からスラッグを取得
    const selectedCategorySlug = CATEGORIES.find(cat => cat.name === editCategory)?.slug;

    if (!selectedCategorySlug) {
      setEditSubmitError('有効なカテゴリを選択してください。');
      return;
    }

    try {
      // Supabaseでプロモコードを更新
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
        .eq('id', editingPromocode.id) // 編集中のプロモコードのIDで指定
        .select(`
            *,
            user:profiles(email)
        `); // 更新されたデータを取得し、user情報も再度取得

      if (updateError) {
        throw updateError;
      }

      // 成功したら、プロモコードリストを更新
      setPromocodes(prevPromocodes =>
        prevPromocodes.map(promo =>
          promo.id === editingPromocode.id ? (data[0] as PromocodeWithUser) : promo
        )
      );
      setEditSubmitSuccess(true); // 成功メッセージを表示
      // handleEditModalClose(); // 自動で閉じるか、ユーザーに成功メッセージを見せるか検討
    } catch (err: any) {
      console.error('プロモコードの更新に失敗しました:', err);
      setEditSubmitError(`プロモコードの更新に失敗しました: ${err.message}`);
    }
  };
  // --- 編集モーダル関連の関数 ここまで ---

  // ローディング中の表示
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-lg text-gray-600">権限を確認中...</p>
      </div>
    );
  }

  // エラー発生時の表示
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">アクセスエラー</h1>
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
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
          管理者ダッシュボード
        </h1>

        {/* 報告されたプロモコードセクション */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            報告されたプロモコード ({reportedPromocodes.length})
          </h2>
          {reportedPromocodes.length === 0 ? (
            <p className="text-center text-gray-600 text-lg">現在、報告されているプロモコードはありません。</p>
          ) : (
            <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-red-50"> {/* 報告セクションのヘッダーを赤系に */}
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      報告日時
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      プロモコードID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      サービス名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      コード
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      報告理由
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">操作</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportedPromocodes.map((report) => (
                    <tr key={report.id} className="hover:bg-red-50"> {/* ホバー時に色を付ける */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(report.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {report.promocode_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {report.promocode?.service_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {report.promocode?.code || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate"> {/* 長い理由を省略 */}
                        {report.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleUpdateReportStatus(report.id, 'resolved')}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          解決済みにする
                        </button>
                        <button
                          onClick={() => handleUpdateReportStatus(report.id, 'dismissed')}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          却下する
                        </button>
                        {/* 報告されたプロモコードの編集/削除もここからできるようにリンクを追加 */}
                        <Link href={`/admin?edit=${report.promocode_id}`} legacyBehavior>
                           <a className="text-indigo-600 hover:text-indigo-900 ml-4">
                             プロモコードを編集
                           </a>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 既存のプロモコード一覧セクション */}
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          全プロモコード一覧 ({promocodes.length})
        </h2>
        {promocodes.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">プロモコードはまだ投稿されていません。</p>
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
                    投稿者
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
                {promocodes.map((promo) => (
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
                    {/* 投稿者情報を表示 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {promo.user?.email || 'N/A'} {/* profiles テーブルの email を表示 */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(promo.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(promo)} // 編集ボタン
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDeletePromocode(promo.id)}
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
