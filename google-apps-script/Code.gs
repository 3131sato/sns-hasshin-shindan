/**
 * SNS発信設計 診断 — 回答ログ受信用 Google Apps Script
 * ------------------------------------------------------------
 * 使い方（詳細は docs/SHEETS-SETUP.md）:
 *  1. 保存用の Google スプレッドシートを新規作成
 *  2. 拡張機能 > Apps Script を開き、このコードを丸ごと貼り付けて保存
 *  3. デプロイ > 新しいデプロイ > 種類「ウェブアプリ」
 *       - 次のユーザーとして実行: 自分
 *       - アクセスできるユーザー: 全員
 *  4. 発行された「ウェブアプリのURL」を Vercel の環境変数
 *       NEXT_PUBLIC_SHEETS_ENDPOINT に設定して再デプロイ
 * ------------------------------------------------------------
 */

var SHEET_NAME = "log";

var HEADERS = [
  "timestamp",
  "session_id",
  "event",         // view（結果閲覧） / cta_click（申込ボタン押下）
  "total_score",
  "stage",         // 現在地
  "type",          // 発信タイプ
  "ratio_shohin",
  "ratio_nayami",
  "ratio_mirai",
  "score_A", "score_B", "score_C", "score_D", "score_E", "score_F",
  "weakest",       // 最も低い軸
  "strongest",     // 最も高い軸
  "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10", "Q11", "Q12"
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000); // 同時書き込みの競合を防ぐ
    var data = JSON.parse(e.postData.contents);
    var sheet = getSheet_();
    var a = data.answers || [];
    var row = [
      new Date(),
      data.session_id || "",
      data.event || "",
      data.total_score,
      data.stage,
      data.type,
      data.ratio_shohin,
      data.ratio_nayami,
      data.ratio_mirai,
      data.score_A, data.score_B, data.score_C, data.score_D, data.score_E, data.score_F,
      data.weakest,
      data.strongest
    ];
    for (var i = 0; i < 12; i++) {
      row.push(a[i] != null ? a[i] : "");
    }
    sheet.appendRow(row);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// 動作確認用（ブラウザでURLを開くと {"ok":true,"info":"..."} が返る）
function doGet() {
  return json_({ ok: true, info: "SNS shindan logger is running." });
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  return sh;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
