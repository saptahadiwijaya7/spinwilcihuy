"use client";

import { useMemo } from "react";
import { wheelColors } from "@/lib/wheelColors";
import { getArrowAngles } from "@/lib/spinLogic";

type Props = {
  names: string[];
  spinning: boolean;
  rotation: number;
  onSpin?: () => void;
  spinDurationMs: number;
  winnerCount: number;
  scale?: number;
  currentPassingName?: string;
};

function getLabelConfig(count: number) {
  if (count <= 12) return { fontSize: 24, radius: 300, maxChars: 18, weight: 900 };
  if (count <= 30) return { fontSize: 18, radius: 318, maxChars: 16, weight: 850 };
  if (count <= 60) return { fontSize: 12.5, radius: 334, maxChars: 13, weight: 800 };
  if (count <= 120) return { fontSize: 8, radius: 348, maxChars: 10, weight: 800 };
  if (count <= 250) return { fontSize: 5.1, radius: 362, maxChars: 8, weight: 800 };
  if (count <= 500) return { fontSize: 3.7, radius: 374, maxChars: 7, weight: 800 };
  return { fontSize: 2.8, radius: 384, maxChars: 6, weight: 800 };
}

function truncateName(name: string, maxChars: number) {
  const clean = name.trim();
  if (clean.length <= maxChars) return clean;
  return `${clean.slice(0, Math.max(1, maxChars - 1))}…`;
}

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const angle = (angleDeg * Math.PI) / 180;
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius
  };
}

function describeSlice(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    "Z"
  ].join(" ");
}

function readableTextRotation(angle: number) {
  const normalized = ((angle % 360) + 360) % 360;
  return normalized > 90 && normalized < 270 ? angle + 180 : angle;
}

export default function SpinWheel({
  names,
  spinning,
  rotation,
  onSpin,
  spinDurationMs,
  winnerCount,
  scale = 1,
  currentPassingName = ""
}: Props) {
  const wheelNames = useMemo(() => names, [names]);
  const count = Math.max(wheelNames.length, 1);
  const segment = 360 / count;
  const arrowAngles = getArrowAngles(Math.min(winnerCount, Math.max(names.length, 1)));
  const labelConfig = getLabelConfig(count);

  return (
    <div
      className="relative mx-auto flex aspect-square w-full items-center justify-center"
      style={{ transform: `scale(${scale})`, transformOrigin: "center center", maxWidth: "540px" }}
    >
      {arrowAngles.map((angle, index) => (
        <div
          key={index}
          className="pointer-events-none absolute inset-0 z-30"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <div className="absolute -right-2 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[18px] border-r-[34px] border-y-transparent border-r-slate-950 drop-shadow-lg" />
          {arrowAngles.length > 1 && (
            <div className="absolute -right-8 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xs font-black text-slate-950 shadow">
              {index + 1}
            </div>
          )}
        </div>
      ))}

      <div
        className="relative aspect-square w-full overflow-hidden rounded-full border-[14px] border-white bg-white shadow-soft transition-transform ease-out"
        style={{
          transform: `rotate(${rotation}deg)`,
          transitionDuration: spinning ? `${spinDurationMs}ms` : "700ms"
        }}
      >
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 1000" aria-hidden="true">
          {wheelNames.length ? (
            wheelNames.map((name, index) => {
              const startAngle = index * segment;
              const endAngle = (index + 1) * segment;
              const labelAngle = startAngle + segment / 2;
              const labelPosition = polarToCartesian(500, 500, labelConfig.radius, labelAngle);
              const textRotation = readableTextRotation(labelAngle);

              return (
                <g key={`${name}-${index}`}>
                  <path
                    d={describeSlice(500, 500, 486, startAngle, endAngle)}
                    fill={wheelColors[index % wheelColors.length]}
                  />
                  <text
                    x={labelPosition.x}
                    y={labelPosition.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textRotation} ${labelPosition.x} ${labelPosition.y})`}
                    fill="white"
                    fontSize={labelConfig.fontSize}
                    fontWeight={labelConfig.weight}
                    letterSpacing={count > 250 ? "0" : ".3"}
                    paintOrder="stroke"
                    stroke="rgba(15,23,42,.44)"
                    strokeWidth={Math.max(0.8, labelConfig.fontSize * 0.18)}
                  >
                    {truncateName(name, labelConfig.maxChars)}
                  </text>
                </g>
              );
            })
          ) : (
            <circle cx="500" cy="500" r="486" fill="#e2e8f0" />
          )}
          <circle cx="500" cy="500" r="486" fill="none" stroke="rgba(255,255,255,.90)" strokeWidth="8" />
          <circle cx="500" cy="500" r="466" fill="none" stroke="rgba(255,255,255,.60)" strokeWidth="4" />
        </svg>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSpin?.();
          }}
          disabled={spinning}
          className="absolute left-1/2 top-1/2 z-20 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-8 border-white bg-slate-950 text-center text-sm font-black text-white shadow-xl transition hover:scale-105 hover:bg-[#c71756] disabled:cursor-wait disabled:hover:scale-100 sm:h-32 sm:w-32"
          aria-label="Klik untuk spin"
        >
          <span className="px-2">
            <span className="block text-xl font-extrabold tracking-tight">SPIN!</span>
            {currentPassingName && (
              <span className="mt-1 block max-w-[5.3rem] truncate rounded-full bg-white/10 px-2 py-1 text-[10px] font-black text-[#f8a6c1]">
                {currentPassingName}
              </span>
            )}
          </span>
        </button>
      </div>

      {names.length > 120 && (
        <div className="absolute bottom-6 z-40 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-slate-700 shadow">
          Semua {names.length} nama tetap ditampilkan untuk transparansi
        </div>
      )}
    </div>
  );
}
