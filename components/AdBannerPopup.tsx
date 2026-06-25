"use client";

import { X } from "lucide-react";

type Props = {
  open: boolean;
  assetUrl: string;
  onClose: () => void;
};

export default function AdBannerPopup({ open, assetUrl, onClose }: Props) {
  if (!open || !assetUrl) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-sm sm:px-8">
      <div className="relative w-full max-w-4xl rounded-[2rem] bg-white p-3 shadow-2xl sm:p-4">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-lg ring-1 ring-slate-200 hover:bg-slate-100"
          aria-label="Tutup banner iklan"
          title="Tutup"
        >
          <X size={17} strokeWidth={3} />
        </button>

        <div className="overflow-hidden rounded-[1.5rem] bg-slate-100">
          <img
            src={assetUrl}
            alt="Banner iklan"
            className="max-h-[78vh] w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
