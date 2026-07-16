import { AXES, type AxisId } from "@/data/questions";

// 6軸レーダーチャート（依存ライブラリなし・SVG手描き）
export default function RadarChart({
  scores,
}: {
  scores: Record<AxisId, number>; // 0〜100
}) {
  const axisOrder: AxisId[] = ["A", "B", "C", "D", "E", "F"];
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const r = 92;
  const n = axisOrder.length;

  // i番目の軸の角度（真上スタート・時計回り）
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, ratio: number) => {
    const a = angle(i);
    return [cx + Math.cos(a) * r * ratio, cy + Math.sin(a) * r * ratio];
  };

  // グリッド（同心多角形）
  const rings = [0.25, 0.5, 0.75, 1];
  const ringPath = (ratio: number) =>
    axisOrder
      .map((_, i) => {
        const [x, y] = point(i, ratio);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ") + " Z";

  // データ多角形
  const dataPath =
    axisOrder
      .map((ax, i) => {
        const [x, y] = point(i, Math.max(0.04, scores[ax] / 100));
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ") + " Z";

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      style={{ maxWidth: 300, display: "block", margin: "0 auto" }}
      role="img"
      aria-label="6軸のスコア"
    >
      {rings.map((ratio) => (
        <path
          key={ratio}
          d={ringPath(ratio)}
          fill="none"
          stroke="var(--line)"
          strokeWidth={1}
        />
      ))}
      {axisOrder.map((_, i) => {
        const [x, y] = point(i, 1);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="var(--line)"
            strokeWidth={1}
          />
        );
      })}
      <path d={dataPath} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
      {axisOrder.map((ax, i) => {
        const [x, y] = point(i, 1.18);
        return (
          <text
            key={ax}
            x={x}
            y={y}
            fontSize={10}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--fg-sub)"
          >
            {AXES[ax].name}
          </text>
        );
      })}
    </svg>
  );
}
