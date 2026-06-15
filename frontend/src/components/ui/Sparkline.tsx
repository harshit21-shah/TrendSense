import { useMemo } from 'react';

interface SparklineProps {
  data?: Array<{ score: number; date?: string } | number>;
  width?: number;
  height?: number;
  fill?: boolean;
  color?: string;
}

export function Sparkline({ data, width = 72, height = 24, fill = false, color }: SparklineProps) {
  const points = useMemo(() => {
    if (!data || data.length < 2) return null;
    const nums = data.map((d) => (typeof d === 'number' ? d : d?.score ?? 0));
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const range = max - min || 1;
    const step = width / (nums.length - 1);

    return nums.map((v, i) => ({
      x: i * step,
      y: height - ((v - min) / range) * (height - 4) - 2,
    }));
  }, [data, width, height]);

  if (!points) {
    return <span className="inline-block opacity-20 text-zinc-700" style={{ width, height }}>—</span>;
  }

  const last = points[points.length - 1].y;
  const first = points[0].y;
  const lineColor = color ?? (first > last ? '#10b981' : first < last ? '#f59e0b' : '#52525b');

  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const fillPath = fill ? `${d} L${width},${height} L0,${height} Z` : undefined;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', overflow: 'visible' }}>
      {fill && fillPath && (
        <path d={fillPath} fill={lineColor} fillOpacity={0.08} />
      )}
      <path d={d} fill="none" stroke={lineColor} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Last point dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={2}
        fill={lineColor}
      />
    </svg>
  );
}
