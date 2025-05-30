// C:\promocode-share\app\components\copyButton.tsx
'use client'; // クライアントコンポーネントとしてマーク

import { useState } from 'react';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline'; // アイコンのインポートパスが正しいか確認してください

// CopyButtonProps インターフェースに className を追加
interface CopyButtonProps {
  code: string;
  className?: string; // ここに className を追加
}

export default function CopyButton({ code, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // 2秒後に「コピーしました」を解除
    } catch (err) {
      console.error('コピーに失敗しました:', err);
      // エラーメッセージをユーザーに表示するなどの処理を追加することもできます
    }
  };

  return (
    <button
      onClick={handleCopy}
      // className プロパティをボタンのルート要素に適用
      className={`inline-flex items-center justify-center p-2 rounded-md transition-colors duration-200 
                 ${copied ? 'bg-green-500 text-white' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}
                 ${className || ''} // ここで渡された className を適用
                `}
      title={copied ? "コピーしました！" : "コードをコピー"}
    >
      {copied ? (
        <CheckIcon className="h-5 w-5" /> // アイコンのサイズを適宜調整
      ) : (
        <ClipboardIcon className="h-5 w-5" /> // アイコンのサイズを適宜調整
      )}
      <span className="sr-only">{copied ? "コピーしました" : "コードをコピー"}</span> {/* スクリーンリーダー向け */}
    </button>
  );
}