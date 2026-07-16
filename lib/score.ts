import {
  questions,
  AXES,
  AXIS_MAX,
  TOTAL_MAX,
  type AxisId,
  type TypeId,
} from "@/data/questions";

export interface DiagnosisResult {
  answers: number[];
  axisScores: Record<AxisId, number>; // 0〜100(%)
  totalScore: number; // 0〜100(%)
  stage: StageId; // 現在地
  type: TypeId; // 発信タイプ
  ratio: { shohin: number; nayami: number; mirai: number }; // 視点割合
  strongest: AxisId; // 最も高い軸（強み）
  weakest: AxisId; // 最も低い軸（弱点）
  priority: AxisId[]; // 改善優先順位（低い軸から最大5つ）
}

export type StageId = "lv1" | "lv2" | "lv3" | "lv4";

// 全問回答済みか
export function isComplete(answers: number[]): boolean {
  return answers.length === questions.length && answers.every((a) => a >= 0);
}

function stageOf(totalPct: number): StageId {
  if (totalPct <= 35) return "lv1";
  if (totalPct <= 60) return "lv2";
  if (totalPct <= 80) return "lv3";
  return "lv4";
}

// 同点時に「弱点として先に出す」軸の優先順位（設計の土台に近い順）
const WEAK_TIE_ORDER: AxisId[] = ["A", "B", "E", "C", "D", "F"];

export function diagnose(answers: number[]): DiagnosisResult {
  const axisRaw: Record<AxisId, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  let ratio = { shohin: 34, nayami: 33, mirai: 33 };
  let type: TypeId = "balance";

  questions.forEach((q, i) => {
    const choice = q.choices[answers[i]];
    if (!choice) return;
    axisRaw[q.axis] += choice.score;
    if (q.isRatio && choice.ratio) {
      ratio = choice.ratio;
      if (choice.typeHint) type = choice.typeHint;
    }
  });

  const axisScores = {} as Record<AxisId, number>;
  (Object.keys(axisRaw) as AxisId[]).forEach((k) => {
    axisScores[k] = Math.round((axisRaw[k] / AXIS_MAX) * 100);
  });

  const totalRaw = (Object.values(axisRaw) as number[]).reduce((a, b) => a + b, 0);
  const totalScore = Math.round((totalRaw / TOTAL_MAX) * 100);

  // 強み・弱点・優先順位
  const axisList = Object.keys(AXES) as AxisId[];
  const strongest = [...axisList].sort(
    (a, b) => axisScores[b] - axisScores[a] || tieRank(a) - tieRank(b)
  )[0];
  const byWeak = [...axisList].sort(
    (a, b) => axisScores[a] - axisScores[b] || tieRank(a) - tieRank(b)
  );
  const weakest = byWeak[0];
  // 弱点（60%未満）を優先的に、最大5つ。全部高得点なら下位2つを提示。
  let priority = byWeak.filter((a) => axisScores[a] < 60);
  if (priority.length === 0) priority = byWeak.slice(0, 2);
  priority = priority.slice(0, 5);

  return {
    answers,
    axisScores,
    totalScore,
    stage: stageOf(totalScore),
    type,
    ratio,
    strongest,
    weakest,
    priority,
  };
}

function tieRank(a: AxisId): number {
  return WEAK_TIE_ORDER.indexOf(a);
}

// スコア(%)→バーの色（強い=緑 / 普通=橙 / 弱い=赤）
export function axisColor(pct: number): string {
  if (pct >= 67) return "var(--good)";
  if (pct >= 34) return "var(--warn)";
  return "var(--bad)";
}
