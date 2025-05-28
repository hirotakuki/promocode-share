// components/copyButton.tsx

'use client';

interface CopyButtonProps {
  code: string;
}

export default function CopyButton({ code }: CopyButtonProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      alert('プロモコードをコピーしました！');
    } catch {
      alert('プロモコードのコピーに失敗しました。');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
    >
      コピー
    </button>
  );
}
