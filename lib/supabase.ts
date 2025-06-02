// C:\promocode-share\lib\supabase.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// 必要に応じて、Supabaseのテーブルの型定義をインポートします
// import { Database } from '@/types/database'; 

// 環境変数が設定されていることの確認ログは残しても良いでしょう。
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error("Supabase URL or Anon Key is missing!");
}

// createClientComponentClient を使用してクライアントを初期化します。
// cookieOptions は直接の引数として渡します。
// <Database> // 型安全性を高める場合、ここに型引数を指定できます
export const supabase = createClientComponentClient({
  // cookieOptions を直接渡します
  cookieOptions: {
    // domain に Vercel のデプロイURLのドメインを指定します。
    // 例: '.promocode-share.vercel.app'
    domain: '.promocode-share.vercel.app', 
    // Secure 属性: HTTPS環境では必須です。本番環境でtrueにします。
    // VercelはHTTPSなので、production環境であればtrueにするのが適切です。
    // NODE_ENV はVercelで自動的に 'production' に設定されます。
    secure: process.env.NODE_ENV === 'production', 
    // Path 属性: クッキーが有効なパス。通常はルートパス '/' を指定します。
    path: '/',
    // SameSite 属性: CSRF保護のため。Next.jsでは 'Lax' が推奨されます。
    sameSite: 'Lax', 
  },
});