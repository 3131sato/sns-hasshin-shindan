// ============================================================
// 計測ログ送信（Google スプレッドシート / GAS など任意のエンドポイントへ）
// - 診断結果の閲覧（view）と CTA クリック（cta_click）を記録する。
// - SHEETS_ENDPOINT が空なら何もしない（開発中・未設定でも安全）。
// - 保存先を差し替えたい場合は lib/config.ts の SHEETS_ENDPOINT を変えるだけ。
// ============================================================

import { questions } from "@/data/questions";
import { SHEETS_ENDPOINT } from "@/lib/config";
import type { DiagnosisResult } from "@/lib/score";

const SID_KEY = "sns_hasshin_sid_v1"; // 診断1回ごとのID
const VIEW_LOGGED_KEY = "sns_hasshin_view_logged_v1"; // view二重送信ガード

// 診断IDを取得（なければ発行）。CTAクリックと診断閲覧を同じIDで紐づける。
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = localStorage.getItem(SID_KEY);
  if (!sid) {
    sid =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(SID_KEY, sid);
  }
  return sid;
}

// 次の診断のためにIDと送信ガードをリセット（「もう一度診断する」時に呼ぶ）
export function resetSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SID_KEY);
  localStorage.removeItem(VIEW_LOGGED_KEY);
}

type EventName = "view" | "cta_click";

function buildPayload(event: EventName, r: DiagnosisResult) {
  // 回答は「選んだ選択肢のラベル」で送る（シート上で人が読める形にする）
  const answers = r.answers.map((idx, i) => questions[i]?.choices[idx]?.label ?? "");
  return {
    session_id: getSessionId(),
    event,
    ts: new Date().toISOString(),
    total_score: r.totalScore,
    stage: r.stage,
    type: r.type,
    ratio_shohin: r.ratio.shohin,
    ratio_nayami: r.ratio.nayami,
    ratio_mirai: r.ratio.mirai,
    score_A: r.axisScores.A,
    score_B: r.axisScores.B,
    score_C: r.axisScores.C,
    score_D: r.axisScores.D,
    score_E: r.axisScores.E,
    score_F: r.axisScores.F,
    weakest: r.weakest,
    strongest: r.strongest,
    answers,
  };
}

function send(payload: object, useBeacon: boolean) {
  if (!SHEETS_ENDPOINT || typeof window === "undefined") return;
  const body = JSON.stringify(payload);
  try {
    // sendBeacon はページ遷移後も送信が完了する（CTAクリック向き）
    if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
      if (navigator.sendBeacon(SHEETS_ENDPOINT, blob)) return;
    }
    // fallback: no-cors の fire-and-forget POST（プリフライトを避けるため text/plain）
    fetch(SHEETS_ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body,
    }).catch(() => {
      /* 計測失敗はユーザー体験に影響させない */
    });
  } catch {
    /* noop */
  }
}

// 診断結果の閲覧を記録（同じ診断IDでは1回だけ）
export function logView(r: DiagnosisResult) {
  if (typeof window === "undefined") return;
  const sid = getSessionId();
  if (localStorage.getItem(VIEW_LOGGED_KEY) === sid) return;
  localStorage.setItem(VIEW_LOGGED_KEY, sid);
  send(buildPayload("view", r), false);
}

// CTAクリックを記録
export function logCtaClick(r: DiagnosisResult) {
  send(buildPayload("cta_click", r), true);
}
