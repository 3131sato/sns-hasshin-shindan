"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AXES, type AxisId } from "@/data/questions";
import { diagnose, isComplete, axisColor, type DiagnosisResult } from "@/lib/score";
import {
  STAGES,
  TYPES,
  AXIS_COPY,
  VALUE_COPY,
  STRENGTH_COPY,
  axisLevel,
  ROADMAP,
  PRODUCT,
} from "@/data/templates";
import {
  PAYMENT_URL,
  FIXED_MESSAGE_1,
  FIXED_MESSAGE_2,
  STORAGE_KEY,
} from "@/lib/config";
import RadarChart from "@/components/RadarChart";
import PieChart from "@/components/PieChart";
import { getSessionId, logView, logCtaClick, resetSession } from "@/lib/track";

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [sid, setSid] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const answers = saved ? (JSON.parse(saved) as number[]) : [];
      if (!isComplete(answers)) {
        router.replace("/diagnose");
        return;
      }
      const diag = diagnose(answers);
      setResult(diag);
      setSid(getSessionId());
      logView(diag); // 診断結果の閲覧を記録（同一診断では1回だけ）
    } catch {
      router.replace("/diagnose");
    }
  }, [router]);

  if (!result) {
    return (
      <main className="container">
        <p className="muted">診断結果を計算中…</p>
      </main>
    );
  }

  const stage = STAGES[result.stage];
  const type = TYPES[result.type];

  const Section = ({
    no,
    title,
    children,
  }: {
    no: string;
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="card">
      <span className="section-no">{no}</span>
      <h2>{title}</h2>
      {children}
    </div>
  );

  const axisComment = (ax: AxisId) => AXIS_COPY[ax][axisLevel(result.axisScores[ax])];

  return (
    <main className="container">
      {/* ヘッダーバッジ */}
      <div className="result-badge">
        <div className="label">あなたのSNS発信の現在地は</div>
        <div className="stage">{stage.name}</div>
        <div className="score-big">{result.totalScore}<span style={{ fontSize: "1rem" }}>点</span></div>
        <div className="label">発信設計スコア（100点満点）</div>
      </div>

      {/* ① 現在地 */}
      <Section no="①" title="現在地">
        <p style={{ fontWeight: 700 }}>{stage.catch}</p>
        <p>{stage.body}</p>
        <div style={{ margin: "16px 0 4px" }}>
          <RadarChart scores={result.axisScores} />
        </div>
        <div style={{ marginTop: 20 }}>
          {(Object.keys(AXES) as AxisId[]).map((ax) => (
            <div className="axis-row" key={ax}>
              <div className="top">
                <span>{AXES[ax].name}</span>
                <strong>{result.axisScores[ax]}%</strong>
              </div>
              <div className="bar">
                <span
                  style={{
                    width: `${result.axisScores[ax]}%`,
                    background: axisColor(result.axisScores[ax]),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ② 商品の本当の価値 */}
      <Section no="②" title="商品の本当の価値">
        <p>{VALUE_COPY[axisLevel(result.axisScores.B)]}</p>
      </Section>

      {/* ③ 発信タイプ */}
      <Section no="③" title={`発信タイプ：${type.name}`}>
        <p>{type.feature}</p>
        <p className="muted">{type.risk}</p>
      </Section>

      {/* ④ 強み */}
      <Section no="④" title={`あなたの強み：${AXES[result.strongest].name}`}>
        <p>{STRENGTH_COPY[result.strongest]}</p>
      </Section>

      {/* ⑤ 弱点 */}
      <Section no="⑤" title={`いちばんの弱点：${AXES[result.weakest].name}`}>
        <p>{AXIS_COPY[result.weakest].weak}</p>
      </Section>

      {/* ⑥ プロフィール診断 */}
      <Section no="⑥" title="プロフィール診断">
        <p>{axisComment("C")}</p>
      </Section>

      {/* ⑦ 導線診断 */}
      <Section no="⑦" title="導線診断">
        <p>{axisComment("E")}</p>
      </Section>

      {/* ⑧ 視点診断 */}
      <Section no="⑧" title="視点診断（商品説明・悩み・未来の割合）">
        <div style={{ margin: "6px 0 14px" }}>
          <PieChart ratio={result.ratio} />
        </div>
        <p>{axisComment("D")}</p>
      </Section>

      {/* ⑨ 改善優先順位TOP5 */}
      <Section no="⑨" title="いま直すべき改善ポイント">
        {result.priority.map((ax, i) => (
          <div className="priority-item" key={ax}>
            <span className="rank">{i + 1}</span>
            <div>
              <strong>{AXES[ax].name}</strong>
              <div className="muted">{AXIS_COPY[ax].fix}</div>
            </div>
          </div>
        ))}
      </Section>

      {/* ⑩ 1か月ロードマップ */}
      <Section no="⑩" title="成果につなげる1か月ロードマップ">
        {ROADMAP[result.stage].map((r) => (
          <div className="roadmap-item" key={r.week}>
            <span className="week">{r.week}</span>
            <span>{r.task}</span>
          </div>
        ))}
      </Section>

      {/* 固定メッセージ */}
      <div className="fixed-msg">{FIXED_MESSAGE_1}</div>

      {/* 発信設計への接続 → 商品 */}
      <div className="card product">
        <p>{PRODUCT.bridge}</p>
        <div className="fixed-msg" style={{ marginTop: 8 }}>{FIXED_MESSAGE_2}</div>
        <h2 style={{ marginTop: 16 }}>{PRODUCT.name}</h2>
        <p className="price">{PRODUCT.price}</p>
        <p>{PRODUCT.lead}</p>
        <ul>
          {PRODUCT.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      </div>

      {/* CTA（追従） */}
      <div className="cta-wrap">
        <a
          className="btn"
          href={sid ? `${PAYMENT_URL}?ref=${encodeURIComponent(sid)}` : PAYMENT_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => logCtaClick(result)}
        >
          発信設計プログラムを見る
        </a>
        <div style={{ marginTop: 10 }}>
          <Link
            className="btn btn-ghost"
            href="/diagnose"
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              resetSession();
            }}
          >
            もう一度診断する
          </Link>
        </div>
      </div>
    </main>
  );
}
