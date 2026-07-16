/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 完全静的サイト（サーバー処理なし・LLM/トークン不使用）。out/ に静的HTMLを書き出す。
  output: "export",
};

export default nextConfig;
