"use client";

import confetti from "canvas-confetti";
import { Maximize2, Play, RotateCcw, Trash2 } from "lucide-react";
import ImportPanel from "@/components/ImportPanel";
import SpinWheel from "@/components/SpinWheel";
import WinnerList, { WinnerRecord } from "@/components/WinnerList";
import WinnerPopup from "@/components/WinnerPopup";
import { normalizeNames, pickWinners } from "@/lib/randomizer";
import { useEffect, useMemo, useRef, useState } from "react";

type HistoryItem = {
  previousNames: string[];
  previousWinners: WinnerRecord[];
};

const STORAGE_KEY = "spinwheel-seminar-state-v1";

export default function HomePage() {
  const [names, setNames] = useState<string[]>([]);
  const [winnerCount, setWinnerCount] = useState(1);
  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [latestWinners, setLatestWinners] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);
  const wheelFullscreenRef = useRef<HTMLElement | null>(null);

  const canSpin = names.length > 0 && !spinning && names.length >= winnerCount;
  const participantPreview = useMemo(() => names.slice(0, 10), [names]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as { names?: string[]; winners?: WinnerRecord[] };
      setNames(normalizeNames(data.names ?? []));
      setWinners(data.winners ?? []);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ names, winners }));
  }, [names, winners]);

  function addNames(incoming: string[]) {
    setNames((current) => normalizeNames([...current, ...incoming]).slice(0, 1000));
  }

  function clearNames() {
    setNames([]);
    setLatestWinners([]);
  }

  function resetAll() {
    setNames([]);
    setWinners([]);
    setHistory([]);
    setLatestWinners([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  function resetWinners() {
    setWinners([]);
    setLatestWinners([]);
  }

  function undoLastSpin() {
    const last = history.at(-1);
    if (!last) return;
    setNames(last.previousNames);
    setWinners(last.previousWinners);
    setLatestWinners([]);
    setHistory((current) => current.slice(0, -1));
  }

  function fullscreenUi() {
    document.documentElement.requestFullscreen?.();
  }

  function fullscreenWheel() {
    wheelFullscreenRef.current?.requestFullscreen?.();
  }

  function spin() {
    if (!canSpin) return;

    setHistory((current) => [...current, { previousNames: names, previousWinners: winners }]);
    setLatestWinners([]);
    setSpinning(true);
    setRotation((current) => current + 1440 + Math.floor(Math.random() * 720));

    window.setTimeout(() => {
      const result = pickWinners(names, winnerCount);
      const batch = winners.length ? Math.max(...winners.map((winner) => winner.batch)) + 1 : 1;
      const now = new Date().toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short"
      });
      const records = result.winners.map((name) => ({ batch, name, wonAt: now }));

      setNames(result.remaining);
      setWinners((current) => [...current, ...records]);
      setLatestWinners(result.winners);
      setShowWinnerPopup(true);
      setSpinning(false);
      confetti({ particleCount: 160, spread: 80, origin: { y: 0.62 } });
    }, 4300);
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <WinnerPopup winners={latestWinners} open={showWinnerPopup} onClose={() => setShowWinnerPopup(false)} />
      <div className="mx-auto max-w-7xl">
        <header className="mascot-header relative mb-6 overflow-hidden rounded-[2rem] p-5 shadow-soft sm:p-7">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/70" />
          
          <div className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full bg-pink-200/60 blur-2xl" />
          <div className="pointer-events-none absolute right-28 top-4 h-28 w-28 rounded-full bg-blue-200/70 blur-2xl" />
          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex rounded-full bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-600 shadow-sm ring-1 ring-blue-100">
                🎉 SAPSOFT
              </div>
              <img
            src="/images/mascot-header.png"
            alt="Mascot SpinWheel Seminar"
            className="pointer-events-none absolute bottom-0 right-0 z-0 hidden h-[135px] w-auto select-none object-contain opacity-95 md:block lg:h-[168px]"
          />
              <h1 className="text-4xl font-black tracking-tight text-slate-950 drop-shadow-sm sm:text-5xl">
                Spinwil <span className="text-blue-600">Cihuy</span>
              </h1>
              {/* <p className="mt-3 max-w-xl rounded-2xl bg-white/75 px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur">
                Undi hingga 1000 peserta, pilih 1-10 pemenang per spin, dan hapus pemenang otomatis dari daftar aktif.
              </p> */}
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-black text-slate-700">
                <span className="rounded-full bg-yellow-100 px-3 py-1.5">🐯 Siap undi!</span>
                <span className="rounded-full bg-pink-100 px-3 py-1.5">🐰 Semoga beruntung</span>
                <span className="rounded-full bg-blue-100 px-3 py-1.5">🐧 Bingung? Tanya kak sapta!</span>
                
              </div>
            </div>
            <div className="flex flex-wrap gap-2 rounded-3xl bg-white/10 p-2 shadow-sm backdrop-blur md:mr-[150px] lg:mr-[5px] lg:mb-[-110px]">
              <button onClick={fullscreenWheel} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-sm hover:bg-blue-50">
                <Maximize2 size={18} /> Bigwil
              </button>
              <button onClick={fullscreenUi} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700">
                <Maximize2 size={18} /> Fulskrin
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr_340px]">
          <aside className="space-y-6">
            <ImportPanel onAddNames={addNames} />

            <section className="rounded-3xl bg-white p-5 shadow-soft">
              <h2 className="mb-4 text-lg font-bold text-slate-950">Kontrol Undian</h2>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Jumlah pemenang per spin</label>
              <input
                type="range"
                min={1}
                max={10}
                value={winnerCount}
                onChange={(event) => setWinnerCount(Number(event.target.value))}
                className="w-full"
              />
              <div className="mb-4 mt-2 text-center text-4xl font-black text-blue-600">{winnerCount}</div>

              <button
                onClick={spin}
                disabled={!canSpin}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-base font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                <Play size={20} fill="currentColor" /> {spinning ? "Sedang spin..." : "Mulai Spin"}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={clearNames} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700">
                  <Trash2 size={15} /> Peserta
                </button>
                <button onClick={resetAll} className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-600">
                  <RotateCcw size={15} /> Reset
                </button>
              </div>
            </section>
          </aside>

          <section ref={wheelFullscreenRef} className="wheel-fullscreen rounded-3xl bg-white/70 p-5 shadow-soft backdrop-blur">
            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Peserta aktif" value={names.length} />
              <Stat label="Total pemenang" value={winners.length} />
              <Stat label="Maks peserta" value="1000" />
              <Stat label="Mode spin" value={winnerCount} />
              {/* <Stat label="Mode spin" value={`${winnerCount} nama`} /> */}
            </div>

            <SpinWheel names={names} spinning={spinning} rotation={rotation} onSpin={spin} />
            <p className="mt-3 text-center text-sm font-semibold text-slate-500">Klik tombol spin atau klik poros wheel untuk memulai undian.</p>

            <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-300">Pemenang Terbaru</p>
              {latestWinners.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {latestWinners.map((name) => (
                    <span key={name} className="rounded-full bg-white px-4 py-2 text-sm font-black text-slate-950">{name}</span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-300">Pemenang akan tampil di sini setelah spin selesai.</p>
              )}
            </div>

            <div className="mt-5 rounded-3xl bg-white p-5">
              <h2 className="mb-3 text-lg font-bold text-slate-950">Preview Peserta Aktif</h2>
              {participantPreview.length ? (
                <div className="flex flex-wrap gap-2">
                  {participantPreview.map((name) => (
                    <span key={name} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">{name}</span>
                  ))}
                  {names.length > 10 && <span className="rounded-full bg-blue-100 px-3 py-2 text-xs font-bold text-blue-700">+{names.length - 10} lainnya</span>}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Belum ada peserta. Import Excel, CSV, Google Sheet, atau paste manual.</p>
              )}
            </div>
          </section>

          <aside>
            <WinnerList
              winners={winners}
              remainingNames={names}
              onUndo={undoLastSpin}
              onResetWinners={resetWinners}
              canUndo={history.length > 0}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
      <p className="text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>
    </div>
  );
}
