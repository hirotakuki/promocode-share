// C:\promocode-share\lib\supabase.ts
// createClient の代わりに、@supabase/auth-helpers-nextjs から
// createClientComponentClient をインポートします。
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// 必要に応じて、Supabaseのテーブルの型定義をインポートします
// import { Database } from '@/types/database'; 

// 環境変数名は.env.localファイルで定義したものと完全に一致させる必要があります。
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 環境変数が存在するか確認（デバッグ用）
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing!");
  // 環境変数が設定されていない場合、エラーをスローするか、デフォルト値を設定するなど
  // ここで適切なエラーハンドリングを行う
}

// createClientComponentClient を使用してクライアントを初期化します。
// これにより、Next.jsのクライアントコンポーネントでSupabaseの認証クッキーが自動的に処理されます。
// 型安全性を高めるために <Database> を追加できますが、必須ではありません。
export const supabase = createClientComponentClient();