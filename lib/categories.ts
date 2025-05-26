// C:\promocode-share\constants\categories.ts

// カテゴリの型を定義
export type Category = {
  name: string;
  slug: string;
};

export const CATEGORIES = [
  { name: "動画配信", slug: "video-streaming" },
  { name: "音楽", slug: "music" },
  { name: "書籍", slug: "books" },
  { name: "ファッション", slug: "fashion" },
  { name: "飲食", slug: "food-drink" },
  { name: "旅行", slug: "travel" },
  { name: "ゲーム", slug: "gaming" },
  { name: "学習", slug: "learning" },
  { name: "スポーツ", slug: "sports" },
  { name: "ショッピング", slug: "shopping" },
  { name: "その他", slug: "other" },
];

export const CATEGORY_NAMES = CATEGORIES.map(cat => cat.name);
export const CATEGORY_SLUGS = CATEGORIES.map(cat => cat.slug);