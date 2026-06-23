"use client";

import { Download, RotateCcw, Trash2 } from "lucide-react";
import { exportRowsToExcel } from "@/lib/excel";
import { buildGoogleSheetCsv } from "@/lib/googleSheet";

export type WinnerRecord = {
  batch: number;
  name: string;
  wonAt: string;
};

type Props = {
  winners: WinnerRecord[];
  remainingNames: string[];
  onUndo: () => void;
  onResetWinners: () => void;
  canUndo: boolean;
};

export default function WinnerList({ winners, remainingNames, onUndo, onResetWinners, canUndo }: Props) {
  function exportWinners() {
    exportRowsToExcel("hasil-pemenang-spinwheel.xlsx", winners.map((winner, index) => ({
      No: index + 1,
      Batch: winner.batch,
      Nama: winner.name,
      Waktu: winner.wonAt
    })));
  }

  function exportRemaining() {
    exportRowsToExcel("sisa-peserta-spinwheel.xlsx", remainingNames.map((name, index) => ({ No: index + 1, Nama: name })));
  }

  function exportCsvForGoogleSheet() {
    const rows = winners.map((winner, index) => ({
      No: index + 1,
      Batch: winner.batch,
      Nama: winner.name,
      Waktu: winner.wonAt
    }));
    const csv = buildGoogleSheetCsv(rows.length ? rows : [{ No: 1, Batch: "", Nama: "", Waktu: "" }]);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hasil-pemenang-google-sheet.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="rounded-3xl bg-white p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Daftar Pemenang</h2>
          <p className="text-sm text-slate-500">{winners.length} pemenang tercatat</p>
        </div>
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          title="Undo spin terakhir"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2">
        <button onClick={exportWinners} disabled={!winners.length} className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-sm font-bold text-white disabled:opacity-40">
          <Download size={16} /> Export Pemenang Excel
        </button>
        <button onClick={exportRemaining} disabled={!remainingNames.length} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 disabled:opacity-40">
          <Download size={16} /> Export Sisa Peserta
        </button>
        <button onClick={exportCsvForGoogleSheet} disabled={!winners.length} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 disabled:opacity-40">
          <Download size={16} /> CSV untuk Google Sheet
        </button>
      </div>

      <div className="max-h-[440px] space-y-2 overflow-auto pr-1">
        {winners.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">Belum ada pemenang.</div>
        ) : (
          [...winners].reverse().map((winner, index) => (
            <div key={`${winner.batch}-${winner.name}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-slate-950">{winner.name}</p>
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700">Batch {winner.batch}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{winner.wonAt}</p>
            </div>
          ))
        )}
      </div>

      <button
        onClick={onResetWinners}
        disabled={!winners.length}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Trash2 size={16} /> Bersihkan Riwayat Pemenang
      </button>
    </section>
  );
}
