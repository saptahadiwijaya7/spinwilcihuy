"use client";

import { Upload, Link2, ClipboardList } from "lucide-react";
import { parseNameFile } from "@/lib/excel";
import { importPublicGoogleSheet } from "@/lib/googleSheet";
import { normalizeNames } from "@/lib/randomizer";
import { useState } from "react";

type Props = {
  onAddNames: (names: string[]) => void;
};

export default function ImportPanel({ onAddNames }: Props) {
  const [manual, setManual] = useState("");
  const [sheetUrl, setSheetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleFile(file?: File) {
    if (!file) return;
    setLoading(true);
    setMessage("");
    try {
      const names = await parseNameFile(file);
      onAddNames(names);
      setMessage(`${names.length} nama berhasil diimpor.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal impor file.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSheetImport() {
    if (!sheetUrl.trim()) return;
    setLoading(true);
    setMessage("");
    try {
      const names = await importPublicGoogleSheet(sheetUrl.trim());
      onAddNames(names);
      setMessage(`${names.length} nama berhasil diimpor dari Google Sheet.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal impor Google Sheet.");
    } finally {
      setLoading(false);
    }
  }

  function handleManualAdd() {
    const names = normalizeNames(manual.split(/[\n,;\t]+/));
    onAddNames(names);
    setManual("");
    setMessage(`${names.length} nama berhasil ditambahkan.`);
  }

  return (
    <section className="rounded-3xl bg-white p-5 shadow-soft">
      <h2 className="mb-4 text-lg font-bold text-slate-950">Import Peserta</h2>

      <label className="mb-3 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-700 hover:border-blue-400 hover:bg-blue-50">
        <Upload size={18} />
        Upload Excel / CSV
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          disabled={loading}
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
      </label>

      <div className="mb-3 rounded-2xl border border-slate-200 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Link2 size={16} /> Google Sheet publik
        </div>
        <input
          value={sheetUrl}
          onChange={(event) => setSheetUrl(event.target.value)}
          placeholder="Tempel URL Google Sheet"
          className="mb-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
        <button
          onClick={handleSheetImport}
          disabled={loading || !sheetUrl.trim()}
          className="w-full rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Import Google Sheet
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <ClipboardList size={16} /> Paste Manual
        </div>
        <textarea
          value={manual}
          onChange={(event) => setManual(event.target.value)}
          rows={5}
          placeholder="Satu nama per baris, atau pisahkan dengan koma"
          className="mb-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
        <button
          onClick={handleManualAdd}
          disabled={!manual.trim()}
          className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Tambahkan Nama
        </button>
      </div>

      {message && <p className="mt-3 text-sm font-medium text-slate-600">{message}</p>}
    </section>
  );
}
