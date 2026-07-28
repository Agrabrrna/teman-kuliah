import React, { useState } from 'react';

export default function SimpleBarChart({ data, xKey, yKey, height = 170, barColor = "#7C3AED" }) {
  const max = Math.max(...data.map((d) => d[yKey]), 1);
  const [hover, setHover] = useState(null);
  
  return (
    <div style={{ height }} className="flex items-end gap-3 px-2 relative">
      {hover !== null && (
        <div
          className="absolute -top-1 px-2 py-1 rounded-lg bg-white border text-xs font-semibold shadow-sm"
          style={{ borderColor: "var(--border)", left: `${(hover / data.length) * 100}%`, transform: "translateX(-10%)" }}
        >
          {data[hover][yKey]} jam
        </div>
      )}
      {data.map((d, i) => (
        <div key={d[xKey]} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
          <div
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className="w-full rounded-t-md transition-all cursor-pointer"
            style={{
              height: `${(d[yKey] / max) * 78}%`,
              background: barColor,
              opacity: hover === null || hover === i ? 1 : 0.55,
              minHeight: 4,
            }}
          />
          <span className="text-[11px] text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>{d[xKey]}</span>
        </div>
      ))}
    </div>
  );
}
