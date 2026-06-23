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
};

export default function SpinWheel({ names, spinning, rotation, onSpin, spinDurationMs, winnerCount }: Props) {
  const wheelNames = useMemo(() => names, [names]);
  const count = Math.max(wheelNames.length, 1);
  const segment = 360 / count;
  const arrowAngles = getArrowAngles(Math.min(winnerCount, Math.max(names.length, 1)));

  const gradient = wheelNames.length
    ? wheelNames
        .map((_, index) => {
          const start = index * segment;
          const end = (index + 1) * segment;
          return `${wheelColors[index % wheelColors.length]} ${start}deg ${end}deg`;
        })
        .join(", ")
    : "#e2e8f0 0deg 360deg";

  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-[540px] items-center justify-center">
      {arrowAngles.map((angle, index) => (
        <div
          key={index}
          className="pointer-events-none absolute inset-0 z-20"
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
        className="relative aspect-square w-full rounded-full border-[14px] border-white shadow-soft transition-transform ease-out"
        style={{
          background: `conic-gradient(from 90deg, ${gradient})`,
          transform: `rotate(${rotation}deg)`,
          transitionDuration: spinning ? `${spinDurationMs}ms` : "700ms"
        }}
      >
        {wheelNames.map((name, index) => {
          const angle = index * segment + segment / 2;
          const showText = wheelNames.length <= 80;
          return showText ? (
            <div
              key={`${name}-${index}`}
              className="wheel-label absolute left-1/2 top-1/2 origin-left text-[10px] font-semibold text-white sm:text-xs"
              style={{ transform: `rotate(${angle}deg) translateX(72px)` }}
            >
              <span className="block max-w-[120px] truncate">{name}</span>
            </div>
          ) : null;
        })}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSpin?.();
          }}
          disabled={spinning}
          className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-8 border-white bg-slate-950 text-center text-sm font-black text-white shadow-xl transition hover:scale-105 hover:bg-blue-700 disabled:cursor-wait disabled:hover:scale-100 sm:h-32 sm:w-32"
          aria-label="Klik untuk spin"
        >
          <span>SPIN<br /><span className="text-[10px] font-semibold opacity-80">klik</span></span>
        </button>
      </div>

      {names.length > 60 && (
        <div className="absolute bottom-6 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-slate-700 shadow">
Label disembunyikan untuk {names.length} nama agar wheel tetap rapi
        </div>
      )}
    </div>
  );
}
