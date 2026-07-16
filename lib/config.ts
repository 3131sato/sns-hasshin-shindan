// サイト全体の定数

export const SITE_NAME = "SNS発信設計 診断";
export const SITE_DESCRIPTION =
  "12の質問に答えるだけで、あなたのSNS発信の現在地と伸びしろが分かる無料診断。";

// 発信設計プログラムの決済ページ
export const PAYMENT_URL = "https://utage-system.com/p/g7rYL16kxTu0";

// 診断結果末尾の固定メッセージ（必ずこの文言で表示する）
export const FIXED_MESSAGE_1 =
  "投稿だけ変えても成果は変わりません。まずは発信設計を整えることをおすすめします。";
export const FIXED_MESSAGE_2 =
  "さらに具体的な設計をご希望の方は、発信設計プログラムをご案内しています。";

// 回答の保存キー（localStorage）
export const STORAGE_KEY = "sns_hasshin_answers_v1";

// ============================================================
// データ保存（ログ計測）用エンドポイント
// Google Apps Script のウェブアプリURLを Vercel 環境変数
//   NEXT_PUBLIC_SHEETS_ENDPOINT
// に設定する（静的サイトなのでビルド時に埋め込まれる）。
// 未設定なら計測は自動でスキップ（エラーは出さない）。
// ※ 別サービス（Supabase等）に差し替える場合も、この定数の向き先を変えるだけ。
// ============================================================
export const SHEETS_ENDPOINT = process.env.NEXT_PUBLIC_SHEETS_ENDPOINT ?? "";
