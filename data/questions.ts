// ============================================================
// 診断の質問データ（トークン不使用・ルールベース）
// 6軸 × 各2問 = 全12問。各選択肢に 0〜3点を割り当て、軸ごとに合算する。
// Q7 は「視点バランス（商品説明/悩み/未来）」を測る特別問題（isRatio）。
// ============================================================

// 診断軸
export type AxisId = "A" | "B" | "C" | "D" | "E" | "F";

// 発信タイプ（Q7の回答から決定）
export type TypeId = "urikomi" | "oyakudachi" | "sekaikan" | "balance" | "maigo";

export interface Choice {
  label: string;
  score: number; // その問題が属する軸への加点（0〜3）
  // 以下は Q7（視点バランス）専用
  ratio?: { shohin: number; nayami: number; mirai: number }; // 合計100
  typeHint?: TypeId;
}

export interface Question {
  id: number;
  axis: AxisId;
  text: string;
  help?: string; // 補足（任意）
  isRatio?: boolean; // Q7 の視点バランス問題フラグ
  choices: Choice[];
}

// 軸のメタ情報（表示名・ひとこと）
export const AXES: Record<AxisId, { name: string; short: string }> = {
  A: { name: "コンセプト設計", short: "誰に何を" },
  B: { name: "価値の言語化", short: "選ばれる理由" },
  C: { name: "プロフィール導線", short: "入口の設計" },
  D: { name: "投稿の視点バランス", short: "何を語るか" },
  E: { name: "導線設計", short: "商品への流れ" },
  F: { name: "継続・仕組み", short: "続けられる型" },
};

export const questions: Question[] = [
  // ---- A. コンセプト設計 ----
  {
    id: 1,
    axis: "A",
    text: "あなたの発信は「誰に向けているか」を一言で言えますか？",
    choices: [
      { label: "はっきり言える（例：3歳児のママ向け）", score: 3 },
      { label: "なんとなくは言える", score: 1 },
      { label: "正直、決めきれていない", score: 0 },
    ],
  },
  {
    id: 2,
    axis: "A",
    text: "あなたの投稿を見た人は「これは自分向けだ」とすぐ分かりますか？",
    choices: [
      { label: "ひと目で伝わる自信がある", score: 3 },
      { label: "見る人によっては伝わる", score: 1 },
      { label: "たぶん伝わっていない／バラついている", score: 0 },
    ],
  },

  // ---- B. 価値の言語化 ----
  {
    id: 3,
    axis: "B",
    text: "あなたの商品・サービスの「本当の価値」を一言で説明できますか？",
    help: "機能ではなく、相手がどう変われるか（例：朝がラクになる）",
    choices: [
      { label: "変化の言葉で言える", score: 3 },
      { label: "特徴・内容なら説明できる", score: 1 },
      { label: "うまく言葉にできていない", score: 0 },
    ],
  },
  {
    id: 4,
    axis: "B",
    text: "「なぜ“あなたから”買うのか」の理由を言えますか？",
    choices: [
      { label: "明確な理由がある", score: 3 },
      { label: "なんとなくはある", score: 1 },
      { label: "他と何が違うか自分でも曖昧", score: 0 },
    ],
  },

  // ---- C. プロフィール導線 ----
  {
    id: 5,
    axis: "C",
    text: "プロフィール文だけで「何をしている人か」が伝わりますか？",
    choices: [
      { label: "ひと目で伝わる", score: 3 },
      { label: "読めばなんとなく分かる", score: 1 },
      { label: "肩書きや情報がバラバラ", score: 0 },
    ],
  },
  {
    id: 6,
    axis: "C",
    text: "プロフィールに「次の行動（リンク・LINE等）」への導線がありますか？",
    choices: [
      { label: "ある＆押される導線になっている", score: 3 },
      { label: "リンクは置いているだけ", score: 1 },
      { label: "特に導線はない", score: 0 },
    ],
  },

  // ---- D. 投稿の視点バランス（Q7 = 特別問題 / Q8） ----
  {
    id: 7,
    axis: "D",
    isRatio: true,
    text: "直近の投稿の内容に、一番近いのはどれですか？",
    help: "この回答から「商品説明／悩み／未来」の割合を診断します。",
    choices: [
      {
        label: "商品・告知・宣伝が中心",
        score: 1,
        ratio: { shohin: 70, nayami: 20, mirai: 10 },
        typeHint: "urikomi",
      },
      {
        label: "悩み解決・ノウハウが中心",
        score: 2,
        ratio: { shohin: 15, nayami: 65, mirai: 20 },
        typeHint: "oyakudachi",
      },
      {
        label: "世界観・実績・未来の話が中心",
        score: 2,
        ratio: { shohin: 15, nayami: 25, mirai: 60 },
        typeHint: "sekaikan",
      },
      {
        label: "バランスよく混ざっている",
        score: 3,
        ratio: { shohin: 34, nayami: 33, mirai: 33 },
        typeHint: "balance",
      },
      {
        label: "バラバラで、意識していない",
        score: 0,
        ratio: { shohin: 34, nayami: 33, mirai: 33 },
        typeHint: "maigo",
      },
    ],
  },
  {
    id: 8,
    axis: "D",
    text: "1つ1つの投稿に「この投稿の目的」を意識できていますか？",
    choices: [
      { label: "毎回、目的を決めて出している", score: 3 },
      { label: "たまに意識する", score: 1 },
      { label: "特に決めずに投稿している", score: 0 },
    ],
  },

  // ---- E. 導線設計 ----
  {
    id: 9,
    axis: "E",
    text: "投稿から商品・サービスを「知ってもらう流れ」はありますか？",
    choices: [
      { label: "投稿→興味→商品、の流れがある", score: 3 },
      { label: "たまに告知する程度", score: 1 },
      { label: "投稿と商品がつながっていない", score: 0 },
    ],
  },
  {
    id: 10,
    axis: "E",
    text: "「今すぐ欲しい人」だけでなく「まだ迷っている人」への導線はありますか？",
    help: "無料相談・LINE登録・お役立ち情報など、次の一歩の受け皿",
    choices: [
      { label: "迷っている人の受け皿がある", score: 3 },
      { label: "売る導線しかない", score: 1 },
      { label: "そもそも受け皿がない", score: 0 },
    ],
  },

  // ---- F. 継続・仕組み ----
  {
    id: 11,
    axis: "F",
    text: "「今日は何を投稿しよう」を、迷わず決められますか？",
    choices: [
      { label: "型があって迷わない", score: 3 },
      { label: "その日の気分で決めている", score: 1 },
      { label: "毎回ネタ探しに悩んで止まる", score: 0 },
    ],
  },
  {
    id: 12,
    axis: "F",
    text: "発信を「続けられる仕組み・型」を持っていますか？",
    choices: [
      { label: "自分の型があり続けられている", score: 3 },
      { label: "続いたり止まったり", score: 1 },
      { label: "続ける仕組みがなく止まりがち", score: 0 },
    ],
  },
];

export const AXIS_MAX = 6; // 各軸2問 × 最大3点
export const TOTAL_MAX = questions.length * 3; // 36
