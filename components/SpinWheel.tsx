"use client";

import { useMemo } from "react";
import { wheelColors } from "@/lib/wheelColors";

type Props = {
  names: string[];
  spinning: boolean;
  rotation: number;
  onSpin?: () => void;
};

export default function SpinWheel({ names, spinning, rotation, onSpin }: Props) {
  const visibleNames = useMemo(() => names.slice(0, 60), [names]);
  const count = Math.max(visibleNames.length, 1);
  const segment = 360 / count;

  const gradient = visibleNames.length
    ? visibleNames
        .map((_, index) => {
          const start = index * segment;
          const end = (index + 1) * segment;
          return `${wheelColors[index % wheelColors.length]} ${start}deg ${end}deg`;
        })
        .join(", ")
    : "#e2e8f0 0deg 360deg";

  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-[540px] items-center justify-center">
      <div className="absolute -right-2 top-1/2 z-20 h-0 w-0 -translate-y-1/2 border-y-[18px] border-r-[34px] border-y-transparent border-r-slate-950 drop-shadow-lg" />

      <div
        className="relative aspect-square w-full rounded-full border-[14px] border-white shadow-soft transition-transform duration-[4200ms] ease-out"
        style={{
          background: `conic-gradient(${gradient})`,
          transform: `rotate(${rotation}deg)`,
          transitionDuration: spinning ? "4200ms" : "700ms"
        }}
      >
        {visibleNames.map((name, index) => {
          const angle = index * segment + segment / 2;
          const showText = visibleNames.length <= 80;
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
          Menampilkan 60 dari {names.length} nama
        </div>
      )}
    </div>
  );
}
