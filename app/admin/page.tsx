// C:\promocode-share\app\admin\page.tsx

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { CATEGORIES } from '@/constants/categories';
import Link from 'next/link';

// PromocodeWithUser インターフェースの定義
interface PromocodeWithUser extends Record<string, any> {
  id: string;
  service_name: string;
  code: string;
  description: string;
  discount: string;
  category_slug: string;
  created_at: string;
  user_id: string;
  expiry_date: string | null;
  user?: {
    email: string;
  };
}

// 新しい報告インターフェース
interface ReportedPromocode {
  id: string;
  promocode_id: string;
  reason: string;
  created_at: string;
  status: 'pending' | 'resolved' | 'dismissed';
  promocode?: {
    service_name: string;
    code: string;
    discount: string;
    category_slug: string;
  };
}

// レポートフィルターの型定義
type ReportFilter = 'pending' | 'resolved' | 'dismissed' | 'all';

export default function AdminPage() {
  const [promocodes, setPromocodes] = useState<PromocodeWithUser[]>([]);
  const [reportedPromocodes, setReportedPromocodes] = useState<ReportedPromocode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPromocode, setEditingPromocode] = useState<PromocodeWithUser | null>(null);
  const [editServiceName, setEditServiceName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDiscount, setEditDiscount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState<string | null>(null);

  const [editSubmitError, setEditSubmitError] = useState<string | null>(null);
  const [editSubmitSuccess, setEditSubmitSuccess] = useState(false);

  // ★追加: 報告フィルターの状態
  const [reportFilter, setReportFilter] = useState<ReportFilter>('pending');

  // データをフェッチする共通関数 (APIルートから取得)
  const fetchAdminData = async () => {
    try {
      const response = await fetch('/api/admin/promocodes');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch admin data from API');
      }
      const data = await response.json();
      setPromocodes(data.promocodes || []);
      setReportedPromocodes(data.reportedPromocodes || []);
    } catch (err: any) {
      console.error('データの取得に失敗しました:', err);
      setError(`データの取得に失敗しました: ${err.message}`);
    }
  };


  // コンポーネントマウント時に管理者権限をチェックし、データをAPIからフェッチ
  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      setLoading(true);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session || !session.user) {
        setError('ログインしていません。');
        router.push('/login');
        return;
      }

      const isAdmin = session.user.user_metadata?.is_admin === true;

      if (!isAdmin) {
        setError('管理者権限がありません。');
        router.push('/');
        return;
      }

      await fetchAdminData(); // データをフェッチ
      setLoading(false);
    };

    checkAdminAndFetchData();
  }, [router]);

  // プロモコード削除ハンドラ (APIルートを呼び出し)
  const handleDeletePromocode = async (id: string) => {
    if (!window.confirm('本当にこのプロモコードを削除しますか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/promocodes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete promocode via API');
      }

      // 成功したら、データを再フェッチしてUIを更新
      await fetchAdminData();
    } catch (err: any) {
      console.error('プロモコードの削除に失敗しました:', err);
      // alert(`プロモコードの削除に失敗しました: ${err.message}`); // 必要に応じてアラート表示
    }
  };

  // 報告のステータスを更新する関数 (APIルートを呼び出すように修正)
  const handleUpdateReportStatus = async (reportId: string, newStatus: 'resolved' | 'dismissed' | 'pending') => {
    // ユーザーが管理者であるかどうかの最終チェック（API側でも行うがクライアントでも念のため）
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || session.user.user_metadata?.is_admin !== true) {
      setError('権限がありません。');
      router.push('/');
      return;
    }

    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update report status via API');
      }

      // 成功したら、データを再フェッチしてUIを更新
      await fetchAdminData();
    } catch (err: any) {
      console.error('報告ステータスの更新に失敗しました:', err);
      // alert(`報告ステータスの更新に失敗しました: ${err.message}`); // 必要に応じてアラート表示
    }
  };

  // 編集ボタンクリック時のハンドラ (APIルートを呼び出し)
  const handleEditClick = (promo: PromocodeWithUser) => {
    setEditingPromocode(promo);
    setEditServiceName(promo.service_name);
    setEditCode(promo.code);
    setEditDescription(promo.description);
    setEditDiscount(promo.discount);
    setEditCategory(CATEGORIES.find(cat => cat.slug === promo.category_slug)?.name || promo.category_slug);
    setEditExpiryDate(promo.expiry_date);
    setIsEditModalOpen(true);
    setEditSubmitError(null);
    setEditSubmitSuccess(false);
  };

  // 編集モーダルを閉じるハンドラ (変更なし)
  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingPromocode(null);
    setEditSubmitError(null);
    setEditSubmitSuccess(false);
  };

  // 編集フォーム送信ハンドラ (APIルートを呼び出し)
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
      const updatedData = {
        service_name: editServiceName,
        code: editCode,
        description: editDescription,
        discount: editDiscount,
        category_slug: selectedCategorySlug,
        expiry_date: editExpiryDate,
      };

      const response = await fetch(`/api/admin/promocodes/${editingPromocode.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update promocode via API');
      }

      // 成功したら、データを再フェッチしてUIを更新
      await fetchAdminData();
      setEditSubmitSuccess(true);
    } catch (err: any) {
      console.error('プロモコードの更新に失敗しました:', err);
      setEditSubmitError(`プロモコードの更新に失敗しました: ${err.message}`);
    }
  };

  // ★追加: フィルターされた報告済みプロモコードを計算
  const filteredReportedPromocodes = reportedPromocodes.filter(report => {
    if (reportFilter === 'all') {
      return true;
    }
    return report.status === reportFilter;
  });

  // ローディング中の表示 (変更なし)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-12 px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-lg text-gray-600">権限を確認中...</p>
      </div>
    );
  }

  // エラー発生時の表示 (変更なし)
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

  // ページのメインコンテンツ
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
          管理者ダッシュボード
        </h1>

        {/* 報告されたプロモコードセクション */}
        <div className="mb-12">
          <div className="flex justify-center items-center gap-4 mb-6">
            <h2 className="text-3xl font-bold text-gray-900 text-center">
              報告されたプロモコード ({filteredReportedPromocodes.length})
            </h2>
            {/* ★追加: フィルターのドロップダウン */}
            <select
              value={reportFilter}
              onChange={(e) => setReportFilter(e.target.value as ReportFilter)}
              className="mt-1 block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="pending">未解決</option>
              <option value="resolved">解決済み</option>
              <option value="dismissed">却下済み</option>
              <option value="all">全て</option>
            </select>
          </div>

          {filteredReportedPromocodes.length === 0 ? (
            <p className="text-center text-gray-600 text-lg">
              {reportFilter === 'pending' ? '現在、未解決の報告はありません。' :
               reportFilter === 'resolved' ? '現在、解決済みの報告はありません。' :
               reportFilter === 'dismissed' ? '現在、却下済みの報告はありません。' :
               '現在、報告されているプロモコードはありません。'}
            </p>
          ) : (
            <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-red-50">
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
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">操作</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReportedPromocodes.map((report) => ( // ★フィルタリングされたリストを使用
                    <tr key={report.id} className="hover:bg-red-50">
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
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                        {report.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {report.status === 'pending' ? '未解決' :
                         report.status === 'resolved' ? '解決済み' :
                         '却下済み'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {report.status === 'pending' ? (
                          <>
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
                          </>
                        ) : (
                          <button
                            onClick={() => handleUpdateReportStatus(report.id, 'pending')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            未解決に戻す
                          </button>
                        )}
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

        {/* 既存のプロモコード一覧セクション (変更なし) */}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {promo.user?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(promo.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(promo)}
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
                  value={editExpiryDate || ''}
                  onChange={(e) => setEditExpiryDate(e.target.value || null)}
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
    </div>
  );
}