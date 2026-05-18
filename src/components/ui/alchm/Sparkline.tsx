import type { JSX } from "react";

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  filled?: boolean;
}

export function Sparkline({
  data,
  width = 140,
  height = 32,
  color = "var(--accent)",
  filled = true,
}: SparklineProps): JSX.Element {
  if (data.length === 0) {
    return <svg width={width} height={height} />;
  }
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points: Array<[number, number]> = data.map((v, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y];
  });
  const path = points
    .map((p, i) => (i === 0 ? `M${p[0]} ${p[1]}` : `L${p[0]} ${p[1]}`))
    .join(" ");
  const fill = filled ? `${path} L${width} ${height} L0 ${height} Z` : null;
  const last = points[points.length - 1];
  return (
    <svg width={width} height={height}>
      {fill && <path d={fill} fill={color} opacity="0.12" />}
      <path d={path} fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      {last && <circle cx={last[0]} cy={last[1]} r="2" fill={color} />}
    </svg>
  );
}

export default Sparkline;
