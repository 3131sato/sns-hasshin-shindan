"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { questions, AXES } from "@/data/questions";
import { STORAGE_KEY } from "@/lib/config";

export default function DiagnosePage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() =>
    Array(questions.length).fill(-1)
  );
  const [hydrated, setHydrated] = useState(false);

  // 途中離脱からの復帰
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as number[];
        if (Array.isArray(parsed) && parsed.length === questions.length) {
          setAnswers(parsed);
        }
      }
    } catch {
      /* noop */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }, [answers, hydrated]);

  const q = questions[current];
  const isLast = current === questions.length - 1;
  const selectedIndex = answers[current];
  const progress = Math.round(((current + 1) / questions.length) * 100);

  const select = (choiceIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = choiceIndex;
      return next;
    });
    // 少し待ってから自動で次へ（最後の問題は自動遷移しない）
    if (!isLast) {
      window.setTimeout(() => setCurrent((c) => c + 1), 180);
    }
  };

  const goNext = () => {
    if (selectedIndex < 0) return;
    if (isLast) {
      router.push("/result");
      return;
    }
    setCurrent((c) => c + 1);
  };

  const goBack = () => {
    if (current === 0) {
      router.push("/");
      return;
    }
    setCurrent((c) => c - 1);
  };

  if (!hydrated) {
    return (
      <main className="container">
        <p className="muted">読み込み中…</p>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="progress" aria-hidden>
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="q-count">
        Q{current + 1} / {questions.length}　<span className="muted">（{AXES[q.axis].name}）</span>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h2>{q.text}</h2>
        {q.help && <p className="muted">{q.help}</p>}
        <div style={{ marginTop: 12 }}>
          {q.choices.map((c, i) => (
            <button
              key={i}
              className={`choice${selectedIndex === i ? " selected" : ""}`}
              onClick={() => select(i)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="nav-row">
        <button className="btn btn-ghost" onClick={goBack}>
          戻る
        </button>
        <button className="btn" onClick={goNext} disabled={selectedIndex < 0}>
          {isLast ? "結果を見る" : "次へ"}
        </button>
      </div>
    </main>
  );
}
