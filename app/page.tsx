import Link from "next/link";
import { questions } from "@/data/questions";

export default function Home() {
  return (
    <main className="container">
      <section className="hero">
        <div className="eyebrow">SNS発信 無料診断</div>
        <h1>
          投稿を変えても成果が出ない——
          <br />
          その原因、“発信設計”かもしれません。
        </h1>
        <p className="muted">
          {questions.length}個の質問に答えるだけ。あなたのSNS発信の「現在地」と「伸びしろ」が分かります。
        </p>
      </section>

      <div className="card">
        <h2>この診断でわかること</h2>
        <ul style={{ paddingLeft: "1.2em", margin: "8px 0 0" }}>
          <li>いまのあなたの発信レベル（現在地）</li>
          <li>あなたの発信タイプと、強み・弱点</li>
          <li>投稿の視点バランス（商品説明・悩み・未来）</li>
          <li>いま直すべき改善ポイントTOP5</li>
          <li>成果につながる1か月ロードマップ</li>
        </ul>
      </div>

      <div className="card" style={{ textAlign: "center" }}>
        <p className="muted" style={{ marginBottom: 14 }}>
          所要時間 約2分／登録不要・無料
        </p>
        <Link href="/diagnose" className="btn">
          無料で診断する
        </Link>
      </div>
    </main>
  );
}
