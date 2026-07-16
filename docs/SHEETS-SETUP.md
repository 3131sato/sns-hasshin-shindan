# Google スプレッドシート連携（回答ログ・CTAクリック計測）の設定手順

診断の「結果閲覧」と「発信設計プログラムのCTAクリック」を、Google スプレッドシートに自動保存します。
**サーバー不要・追加費用ゼロ**。所要 約10分。

---

## 全体像

```
診断アプリ（Vercel）
   │  結果を見たとき（view）／CTAを押したとき（cta_click）にJSONをPOST
   ▼
Google Apps Script（ウェブアプリ）
   ▼
Google スプレッドシート（1行ずつ追記）→ ピボットで可視化
```

---

## 手順

### 1. スプレッドシートを作成
[sheets.new](https://sheets.new) で新しいスプレッドシートを作成（名前は「SNS診断ログ」など任意）。

### 2. Apps Script を設定
1. スプレッドシート上部メニュー **拡張機能 → Apps Script** を開く
2. 既存のコードを全部消し、`google-apps-script/Code.gs` の中身を丸ごと貼り付けて保存（💾）

### 3. ウェブアプリとしてデプロイ
1. 右上 **デプロイ → 新しいデプロイ**
2. 歯車⚙️ → **ウェブアプリ** を選択
3. 設定：
   - **次のユーザーとして実行**：自分
   - **アクセスできるユーザー**：**全員**（← これがないと計測できません）
4. **デプロイ** → 初回は権限の許可を求められるので承認
5. 表示される **ウェブアプリのURL**（`https://script.google.com/macros/s/.../exec`）をコピー

> 動作確認：そのURLをブラウザで開いて `{"ok":true,...}` が出ればOK。

### 4. Vercel に URL を設定
1. [Vercel](https://vercel.com) → プロジェクト **sns-hasshin-shindan** → **Settings → Environment Variables**
2. 追加：
   - **Key**：`NEXT_PUBLIC_SHEETS_ENDPOINT`
   - **Value**：手順3でコピーしたウェブアプリURL
   - Environment：Production（＋必要ならPreview）
3. **Save**
4. **Deployments → 最新をRedeploy**（環境変数はビルド時に埋め込まれるため再デプロイ必須）

これで、診断が使われるたびにスプレッドシートへ行が追加されます。

---

## 記録される列

| 列 | 内容 |
|---|---|
| timestamp | 記録時刻 |
| session_id | 診断1回ごとのID（viewとcta_clickを紐づけ） |
| event | `view`（結果を見た） / `cta_click`（申込ボタンを押した） |
| total_score / stage / type | 総合点・現在地・発信タイプ |
| ratio_shohin/nayami/mirai | 投稿の視点割合(%) |
| score_A〜F | 6軸スコア(%) |
| weakest / strongest | 最も低い軸／高い軸 |
| Q1〜Q12 | 各質問で選んだ回答（文言） |

---

## 可視化のしかた（ピボットテーブル例）

スプレッドシートの **挿入 → ピボットテーブル** で、以下がすぐ作れます。

**A. 発信タイプ別のCTAクリック傾向**
- 行：`type`
- 値：`session_id`（COUNTA）
- フィルタ：`event` を `cta_click` に絞る
→ どの発信タイプが一番申込ボタンを押しているかが分かる

**B. 弱点別の反応**
- 行：`weakest`、値：`session_id` の件数、フィルタ：`event=cta_click`

**C. クリック率（view→cta_click）**
- 行：`type`、列：`event`、値：`session_id` の件数
→ 「viewの数」と「cta_clickの数」を並べれば、タイプ別のクリック率が出せる

---

## 実際の「申込」まで追いたい場合（発展）

CTAクリックは**申込意欲**の計測です。CTAの決済URLには診断IDが付きます（例：`...?ref=<session_id>`）。
UTAGE側でこの `ref` を注文情報として保存できれば、後から「どの診断の人が実際に購入したか」を突合できます。
（この突合はUTAGE側の設定が必要なため、必要になったらご相談ください。）

---

## 保存先を Supabase 等に変えたい場合

`lib/track.ts` はエンドポイントに JSON を POST するだけの共通処理です。
`lib/config.ts` の `SHEETS_ENDPOINT` の向き先を Supabase の関数URL等に変えれば、そのまま差し替えできます。
