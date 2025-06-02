// C:\promocode-share\app\components\AdAndCodeDisplay.tsx
'use client'; // クライアントコンポーネントとしてマーク

import { useEffect, useState } from 'react';
import CopyButton from '@/app/components/copyButton';
import Link from 'next/link';
import { CATEGORIES } from '@/constants/categories'; // CATEGORIES をインポート

const AD_DISPLAY_TIME = 5; // 広告表示時間（秒）

interface Promocode {
  id: string;
  service_name: string;
  code: string;
  discount: string;
  description: string;
  category_slug: string; // カテゴリslugを使用
  uses: number;
  created_at: string;
  expires_at?: string;
}

interface AdAndCodeDisplayProps {
  promocode: Promocode;
}

export default function AdAndCodeDisplay({ promocode }: AdAndCodeDisplayProps) {
  const [showAd, setShowAd] = useState(true);
  const [countdown, setCountdown] = useState(AD_DISPLAY_TIME);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false); // 報告モーダルの表示状態
  const [reportReason, setReportReason] = useState(''); // 報告理由
  const [reportStatus, setReportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle'); // 報告送信ステータス

  // カテゴリ名を取得するヘルパー関数
  const getCategoryName = (slug: string) => {
    const category = CATEGORIES.find(cat => cat.slug === slug);
    return category ? category.name : '不明なカテゴリ';
  };

  useEffect(() => {
    if (showAd) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowAd(false);
            // オプション: ここで利用回数を更新するAPI呼び出しを行うことも可能
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showAd]);

  // 報告フォームの送信ハンドラ
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportStatus('loading');

    if (!reportReason.trim()) {
      setReportStatus('error');
      // alert('報告理由を入力してください。'); // alertの代わりにカスタムUIを使用
      return;
    }

    try {
      const response = await fetch('/api/report-promocode', { // 新しいAPIルートを呼び出し
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promocodeId: promocode.id,
          reason: reportReason,
        }),
        // ★ここが変更点です★
        credentials: 'include', 
      });

      if (response.ok) {
        setReportStatus('success');
        setReportReason(''); // フォームをクリア
        // alert('プロモコードが報告されました。'); // alertの代わりにカスタムUIを使用
        setTimeout(() => setIsReportModalOpen(false), 2000); // 2秒後にモーダルを閉じる
      } else {
        const errorData = await response.json();
        setReportStatus('error');
        // alert(`報告に失敗しました: ${errorData.message || 'サーバーエラー'}`); // alertの代わりにカスタムUIを使用
      }
    } catch (error) {
      console.error('プロモコード報告エラー:', error);
      setReportStatus('error');
      // alert('報告中にエラーが発生しました。'); // alertの代わりにカスタムUIを使用
    }
  };

  return (
    <>
      {showAd ? (
        <div className="text-center py-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">広告表示中...</h2>
          <p className="text-xl text-gray-600 mb-6">
            プロモコードを表示するまであと {countdown} 秒...
          </p>
          {/* ここに実際の広告コード（Google AdSense、AdMobなどのSDK/スクリプト）を挿入 */}
          <div className="bg-gray-200 h-48 flex items-center justify-center text-gray-500 rounded-md">
            [ここに広告が表示されます - 例: Google AdSense コード]
          </div>
          {/* カウントダウンが0になったら広告をスキップするボタンは不要 */}
          {countdown === 0 && (
              <button
                  onClick={() => setShowAd(false)}
                  className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                広告をスキップ
              </button>
          )}
        </div>
      ) : (
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">
            プロモコードの詳細
          </h1>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8 text-center">
            <p className="text-lg font-semibold text-gray-600 mb-2">サービス名:</p>
            <h2 className="text-3xl font-bold text-indigo-700 mb-4">{promocode.service_name}</h2>

            <p className="text-lg font-semibold text-gray-600 mb-2">プロモコード:</p>
            <div className="flex items-center justify-center bg-indigo-100 rounded-md p-4 mb-4 shadow-inner">
              <span className="text-4xl font-extrabold text-indigo-800 tracking-wide break-all">
                {promocode.code}
              </span>
              <CopyButton code={promocode.code} className="ml-4 p-2 sm:p-3 text-2xl" />
            </div>

            <p className="text-lg font-semibold text-gray-600 mb-2">割引内容:</p>
            <p className="text-2xl font-bold text-green-600 mb-4">{promocode.discount}</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-3">説明:</h3>
            <p className="text-gray-700 text-base leading-relaxed">{promocode.description}</p>
          </div>

          {promocode.expires_at && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-center">
              <p className="text-lg font-semibold text-gray-700">
                有効期限: <span className="font-bold text-red-600">{new Date(promocode.expires_at).toLocaleDateString()}</span>
              </p>
            </div>
          )}

          {/* バナー広告表示スペース */}
          <div className="mt-8 text-center">
            <div className="bg-gray-200 h-32 flex items-center justify-center text-gray-500 rounded-md">
              [ここにバナー広告が表示されます - 例: Google AdSense コード]
            </div>
          </div>
          
          {/* 広告表示後にのみ関連カテゴリへのリンクを表示 */}
          <div className="mt-10 text-center">
            <Link href={`/category/${promocode.category_slug}`} legacyBehavior>
              <a className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                {getCategoryName(promocode.category_slug)}関連の他のプロモコードを見る
              </a>
            </Link>
          </div>

          {/* 報告ボタンを追加 */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-md"
            >
              このプロモコードを報告する
            </button>
          </div>
        </div>
      )}

      {/* 報告モーダル */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-fade-in-up">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">プロモコードを報告</h3>
            <p className="text-gray-700 mb-6 text-center">
              このプロモコードに問題がある場合、理由を教えてください。
            </p>
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label htmlFor="report-reason" className="block text-sm font-medium text-gray-700">
                  報告理由
                </label>
                <textarea
                  id="report-reason"
                  rows={4}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                ></textarea>
              </div>

              {reportStatus === 'error' && (
                <p className="text-red-600 text-sm">報告に失敗しました。理由を確認してください。</p>
              )}
              {reportStatus === 'success' && (
                <p className="text-green-600 text-sm">プロモコードが報告されました。ありがとうございます。</p>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsReportModalOpen(false);
                    setReportReason('');
                    setReportStatus('idle');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={reportStatus === 'loading'}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {reportStatus === 'loading' ? '送信中...' : '報告する'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}