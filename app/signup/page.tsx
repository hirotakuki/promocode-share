'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // パスワード確認用
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('パスワードが一致しません。');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(`サインアップに失敗しました: ${error.message}`);
    } else {
      if (data.user && data.user.identities && data.user.identities.length === 0 && !data.session) {
        setMessage('確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。');
      } else if (data.user) {
        setMessage('サインアップに成功しました！ログインページへリダイレクトします...');
        // サインアップ成功後、ログインページにリダイレクトするか、そのままログイン状態にするかは設計によります。
        // Supabaseのデフォルトではメール確認が有効な場合が多いので、確認後の自動ログインはSupabase側で設定したリダイレクトURLに依存します。
        // ここでは例としてログインページにリダイレクトします。
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setMessage('サインアップ処理が完了しましたが、予期せぬ応答がありました。');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            アカウント登録
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          <div className="rounded-md shadow-sm -space-y-px">
            {/* Email Input */}
            <div>
              <label htmlFor="email-address" className="sr-only">メールアドレス</label>
              <input
                id="email-address" name="email" type="email" autoComplete="email" required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {/* Password Input */}
            <div>
              <label htmlFor="password" className="sr-only">パスワード</label>
              <input
                id="password" name="password" type="password" autoComplete="new-password" required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="パスワード (6文字以上)" value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirm-password" className="sr-only">パスワード確認</label>
              <input
                id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="パスワード確認" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? '処理中...' : '登録する'}
            </button>
          </div>
        </form>
        {message && (
          <p className={`mt-2 text-center text-sm ${message.includes('失敗') || message.includes('一致しません') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
        <p className="mt-2 text-center text-sm text-gray-600">
          すでにアカウントをお持ちですか？{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}