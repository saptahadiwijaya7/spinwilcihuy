"use client";

import { X } from "lucide-react";
import { wheelColors } from "@/lib/wheelColors";

type Props = {
  winners: string[];
  open: boolean;
  onClose: () => void;
};

function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function WinnerPopup({ winners, open, onClose }: Props) {
  if (!open || !winners.length) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-sm sm:px-8">
      <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] bg-white p-5 text-center shadow-2xl sm:p-8 lg:p-10">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-slate-100 p-2 text-slate-600 shadow-sm hover:bg-slate-200"
          aria-label="Tutup popup pemenang"
        >
          <X size={22} />
        </button>

        <div className="shrink-0 px-8">
          <p className="text-3xl sm:text-4xl">🏆</p>
          <p className="mt-2 text-xl font-black uppercase tracking-[0.18em] text-[#ed3969] sm:text-3xl">Selamat!</p>
          <p className="mt-2 text-sm font-bold text-slate-500 sm:text-base">
            Berikut adalah {winners.length} pemenang
          </p>
        </div>

        <div
          className={`mt-6 grid flex-1 ${winners.length === 1 ? 'grid-cols-1 sm:grid-cols-1 place-items-center' : 'grid-cols-1 sm:grid-cols-2'} content-center gap-3 overflow-y-auto px-1 sm:gap-4`}
        >
          {winners.map((name, index) => {
            const color = wheelColors[index % wheelColors.length];
            return (
              <div
                key={`${name}-${index}`}
                className={`flex min-h-[76px] items-center justify-center gap-4 rounded-3xl border px-4 py-4 shadow-sm sm:min-h-[86px] ${winners.length === 1 ? 'justify-self-center w-full sm:w-auto sm:max-w-md zoom-in' : ''}`}
                style={{
                  background: `linear-gradient(135deg, ${hexToRgba(color, 0.20)}, ${hexToRgba(color, 0.08)})`,
                  borderColor: hexToRgba(color, 0.30)
                }}
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-black text-white shadow-md"
                  style={{ backgroundColor: color }}
                >
                  {index + 1}
                </div>
                <p className="min-w-0 break-words text-center text-2xl font-black leading-tight text-slate-950 sm:text-3xl lg:text-4xl">
                  {name}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 shrink-0">
          <button
            onClick={onClose}
            className="rounded-2xl bg-slate-950 px-8 py-4 text-base font-black text-white shadow-lg hover:bg-[#c71756]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
