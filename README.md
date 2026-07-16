# SNS発信設計 診断アプリ

個人事業主・店舗経営者向けに、SNS発信の現在地と問題点を **トークン（LLM）を一切使わずルールベースで診断** し、解決策として「発信設計プログラム」へ誘導する集客ファネル。

## 特徴
- **完全静的・API課金ゼロ**（Claude等のLLMは不使用）。何人が診断してもランニングコストは変わらない。
- 12問の選択式 → 6軸スコア計算 → 現状・弱点を提示し、必ず「発信設計」へ着地。
- Next.js (App Router) / TypeScript / 静的export（Vercel前提）。

## 診断の構成
- 6軸：A.コンセプト設計 / B.価値の言語化 / C.プロフィール導線 / D.視点バランス / E.導線設計 / F.継続・仕組み
- 結果は①現在地〜⑩ロードマップ＋商品訴求＋固定文＋CTA。

## 主要ファイル（中身の編集ポイント）
- `data/questions.ts` … 質問・選択肢・配点（★編集頻度が高い）
- `data/templates.ts` … 結果テンプレ文・商品訴求（★編集頻度が高い）
- `lib/score.ts` … スコア計算ロジック
- `lib/config.ts` … 決済URL・固定文などの定数

## 開発
```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # out/ に静的HTMLを出力
```

## データ保存・計測（任意）
診断の「結果閲覧(view)」と「CTAクリック(cta_click)」を Google スプレッドシートに記録できる。
- 送信処理: `lib/track.ts`（エンドポイントにJSONをPOSTするだけ。保存先の差し替えも容易）
- 受け側: `google-apps-script/Code.gs`（スプレッドシートに紐づくGASウェブアプリ）
- 設定手順: `docs/SHEETS-SETUP.md`
- 環境変数 `NEXT_PUBLIC_SHEETS_ENDPOINT` にGASのURLを設定（未設定なら計測はスキップ）
- CTAの決済URLには診断ID（`?ref=<session_id>`）が付き、将来の購入突合に使える

## デプロイ
GitHub にpush → Vercel連携で自動デプロイ（`output: "export"` の静的サイト）。
環境変数を追加/変更したら **再デプロイ**（静的サイトはビルド時に値が埋め込まれるため）。
