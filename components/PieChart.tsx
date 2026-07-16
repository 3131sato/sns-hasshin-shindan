// 商品説明・悩み・未来の割合を示す円グラフ（依存なし・SVG手描き）
export default function PieChart({
  ratio,
}: {
  ratio: { shohin: number; nayami: number; mirai: number };
}) {
  const data = [
    { key: "商品説明", value: ratio.shohin, color: "#f0a15a" },
    { key: "悩み", value: ratio.nayami, color: "#5aa9f0" },
    { key: "未来", value: ratio.mirai, color: "#7ecb8f" },
  ];
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = 78;

  let acc = 0;
  const arcs = data.map((d) => {
    const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += d.value;
    const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const large = end - start > Math.PI ? 1 : 0;
    const x1 = cx + Math.cos(start) * r;
    const y1 = cy + Math.sin(start) * r;
    const x2 = cx + Math.cos(end) * r;
    const y2 = cy + Math.sin(end) * r;
    const path = `M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large} 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`;
    return { ...d, path };
  });

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={160} height={160} role="img" aria-label="投稿の視点割合">
        {arcs.map((a) => (
          <path key={a.key} d={a.path} fill={a.color} stroke="var(--bg-card)" strokeWidth={2} />
        ))}
      </svg>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
        {data.map((d) => (
          <li key={d.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: d.color, display: "inline-block" }} />
            <span style={{ minWidth: 68 }}>{d.key}</span>
            <strong>{Math.round((d.value / total) * 100)}%</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
