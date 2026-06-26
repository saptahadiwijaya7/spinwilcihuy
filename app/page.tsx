"use client";

import confetti from "canvas-confetti";
import { Maximize2, Play, RotateCcw, Trash2, Volume2, VolumeX } from "lucide-react";
import ImportPanel from "@/components/ImportPanel";
import SpinWheel from "@/components/SpinWheel";
import WinnerList, { WinnerRecord } from "@/components/WinnerList";
import WinnerPopup from "@/components/WinnerPopup";
import AdBannerPopup from "@/components/AdBannerPopup";
import { normalizeNames } from "@/lib/randomizer";
import { calculateAccurateSpin } from "@/lib/spinLogic";
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
  const [spinDuration, setSpinDuration] = useState(5);
  const [winnerRevealDelay, setWinnerRevealDelay] = useState(1);
  const [soundMuted, setSoundMuted] = useState(false);
  const [wheelScale, setWheelScale] = useState(1);
  const [isWheelFullscreen, setIsWheelFullscreen] = useState(false);
  const [isPageFullscreen, setIsPageFullscreen] = useState(false);
  const [currentPassingName, setCurrentPassingName] = useState("");
  const wheelFullscreenRef = useRef<HTMLElement | null>(null);
  const spinFinishTimerRef = useRef<number | null>(null);
  const revealTimerRef = useRef<number | null>(null);
  const [customSpinSound, setCustomSpinSound] = useState<string>("");
  const [customWinSound, setCustomWinSound] = useState<string>("");
  const [adBannerEnabled, setAdBannerEnabled] = useState(false);
  const [adBannerAsset, setAdBannerAsset] = useState<string>("");
  const [showAdBanner, setShowAdBanner] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const spinSoundTimerRef = useRef<number | null>(null);
  const passingNameTimerRef = useRef<number | null>(null);
  const spinAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  const soundMutedRef = useRef(soundMuted);

  const canSpin = names.length > 0 && !spinning && names.length >= winnerCount;
  const participantPreview = useMemo(() => names.slice(0, 10), [names]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as { names?: string[]; winners?: WinnerRecord[]; spinDuration?: number; winnerRevealDelay?: number; soundMuted?: boolean; customSpinSound?: string; customWinSound?: string; adBannerEnabled?: boolean; adBannerAsset?: string };
      setNames(normalizeNames(data.names ?? []));
      setWinners(data.winners ?? []);
      setSpinDuration(Math.max(2, Math.min(60, Number(data.spinDuration ?? 5))));
      setWinnerRevealDelay(Math.max(0, Math.min(10, Number(data.winnerRevealDelay ?? 1))));
      setSoundMuted(Boolean(data.soundMuted));
      setCustomSpinSound(data.customSpinSound ?? "");
      setCustomWinSound(data.customWinSound ?? "");
      setAdBannerEnabled(Boolean(data.adBannerEnabled));
      setAdBannerAsset(data.adBannerAsset ?? "");
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    soundMutedRef.current = soundMuted;
    if (soundMuted) stopSpinSound();
  }, [soundMuted]);

  useEffect(() => {
    function handleFullscreenChange() {
      const fullscreenElement = document.fullscreenElement;
      setIsWheelFullscreen(fullscreenElement === wheelFullscreenRef.current);
      setIsPageFullscreen(fullscreenElement === document.documentElement);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    return () => {
      stopSpinSound();
      if (spinFinishTimerRef.current !== null) window.clearTimeout(spinFinishTimerRef.current);
      if (revealTimerRef.current !== null) window.clearTimeout(revealTimerRef.current);
      if (passingNameTimerRef.current !== null) window.clearInterval(passingNameTimerRef.current);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ names, winners, spinDuration, winnerRevealDelay, soundMuted, customSpinSound, customWinSound, adBannerEnabled, adBannerAsset }));
  }, [names, winners, spinDuration, winnerRevealDelay, soundMuted, customSpinSound, customWinSound, adBannerEnabled, adBannerAsset]);

  function addNames(incoming: string[]) {
    setNames((current) => normalizeNames([...current, ...incoming]).slice(0, 1000));
  }

  function clearNames() {
    setNames([]);
    setLatestWinners([]);
    setCurrentPassingName("");
    setShowAdBanner(false);
    setShowWinnerPopup(false);
  }

  function resetAll() {
    setNames([]);
    setWinners([]);
    setHistory([]);
    setLatestWinners([]);
    setCurrentPassingName("");
    setShowAdBanner(false);
    setShowWinnerPopup(false);
    localStorage.removeItem(STORAGE_KEY);
    if (spinFinishTimerRef.current !== null) {
      window.clearTimeout(spinFinishTimerRef.current);
      spinFinishTimerRef.current = null;
    }
    if (revealTimerRef.current !== null) {
      window.clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
  }

  function resetWinners() {
    setWinners([]);
    setLatestWinners([]);
    setCurrentPassingName("");
    setShowAdBanner(false);
    setShowWinnerPopup(false);
  }

  function undoLastSpin() {
    const last = history.at(-1);
    if (!last) return;
    setNames(last.previousNames);
    setWinners(last.previousWinners);
    setLatestWinners([]);
    setCurrentPassingName("");
    setShowAdBanner(false);
    setShowWinnerPopup(false);
    setHistory((current) => current.slice(0, -1));
  }

  function fullscreenUi() {
    document.documentElement.requestFullscreen?.();
  }

  function fullscreenWheel() {
    wheelFullscreenRef.current?.requestFullscreen?.();
  }

  function exitFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
  }

  function getAudioContext() {
    if (soundMutedRef.current) return null;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioContextRef.current) audioContextRef.current = new AudioContextClass();
    void audioContextRef.current.resume();
    return audioContextRef.current;
  }

  function playTickSound() {
    const context = getAudioContext();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(520 + Math.random() * 180, context.currentTime);
    gain.gain.setValueAtTime(0.035, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.045);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.05);
  }

  function startSpinSound() {
    if (soundMutedRef.current) return;
    stopSpinSound();

    if (customSpinSound && spinAudioRef.current) {
      spinAudioRef.current.currentTime = 0;
      spinAudioRef.current.loop = true;
      void spinAudioRef.current.play().catch(() => {
        playTickSound();
        spinSoundTimerRef.current = window.setInterval(playTickSound, 85);
      });
      return;
    }

    playTickSound();
    spinSoundTimerRef.current = window.setInterval(playTickSound, 85);
  }

  function stopSpinSound() {
    if (spinAudioRef.current) {
      spinAudioRef.current.pause();
      spinAudioRef.current.currentTime = 0;
    }
    if (spinSoundTimerRef.current === null) return;
    window.clearInterval(spinSoundTimerRef.current);
    spinSoundTimerRef.current = null;
  }

  function startPassingNamePreview(sourceNames: string[], plannedWinners: string[]) {
    if (passingNameTimerRef.current !== null) {
      window.clearInterval(passingNameTimerRef.current);
      passingNameTimerRef.current = null;
    }
    if (!sourceNames.length) return;

    let tick = 0;
    passingNameTimerRef.current = window.setInterval(() => {
      tick += 1;
      const randomName = sourceNames[Math.floor(Math.random() * sourceNames.length)];
      setCurrentPassingName(randomName ?? "");
    }, 70);

    window.setTimeout(() => {
      if (passingNameTimerRef.current !== null) {
        window.clearInterval(passingNameTimerRef.current);
        passingNameTimerRef.current = null;
      }
      setCurrentPassingName(plannedWinners[0] ?? "");
    }, Math.max(250, spinDuration * 1000 - 220));
  }

  function handleCustomSoundUpload(file: File | undefined, target: "spin" | "win") {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result ?? "");
      if (target === "spin") setCustomSpinSound(value);
      else setCustomWinSound(value);
    };
    reader.readAsDataURL(file);
  }

  function handleAdBannerUpload(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAdBannerAsset(String(reader.result ?? ""));
      setAdBannerEnabled(true);
    };
    reader.readAsDataURL(file);
  }

  function revealWinnerPopup() {
    setShowAdBanner(false);
    setShowWinnerPopup(true);
    playTrumpetSound();
    confetti({ particleCount: 160, spread: 80, origin: { y: 0.62 } });
  }

  function closeAdBannerAndRevealWinners() {
    if (latestWinners.length > 0) revealWinnerPopup();
    else setShowAdBanner(false);
  }

  function playTrumpetSound() {
    if (!soundMutedRef.current && customWinSound && winAudioRef.current) {
      winAudioRef.current.currentTime = 0;
      void winAudioRef.current.play().catch(() => {});
      return;
    }
    const context = getAudioContext();
    if (!context) return;
    const now = context.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((frequency, index) => {
      const start = now + index * 0.13;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.10, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.24);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.26);
    });
  }

  function spin() {
    if (!canSpin) return;

    const plannedResult = calculateAccurateSpin(names, winnerCount, rotation, spinDuration);

    setHistory((current) => [...current, { previousNames: names, previousWinners: winners }]);
    setLatestWinners([]);
    setCurrentPassingName("");
    setShowWinnerPopup(false);
    setShowAdBanner(false);
    setSpinning(true);
    const spinDurationMs = spinDuration * 1000;
    const revealDelayMs = winnerRevealDelay * 1000;
    startSpinSound();
    startPassingNamePreview(names, plannedResult.winners);
    setRotation(plannedResult.finalRotation);

    if (spinFinishTimerRef.current !== null) {
      window.clearTimeout(spinFinishTimerRef.current);
    }
    if (revealTimerRef.current !== null) {
      window.clearTimeout(revealTimerRef.current);
    }

    spinFinishTimerRef.current = window.setTimeout(() => {
      stopSpinSound();
      if (passingNameTimerRef.current !== null) {
        window.clearInterval(passingNameTimerRef.current);
        passingNameTimerRef.current = null;
      }
      setCurrentPassingName(plannedResult.winners[0] ?? "");
      setSpinning(false);

      revealTimerRef.current = window.setTimeout(() => {
        const result = plannedResult;
        const batch = winners.length ? Math.max(...winners.map((winner) => winner.batch)) + 1 : 1;
        const now = new Date().toLocaleString("id-ID", {
          dateStyle: "medium",
          timeStyle: "short"
        });
        const records = result.winners.map((name) => ({ batch, name, wonAt: now }));

        setNames(result.remaining);
        setWinners((current) => [...current, ...records]);
        setLatestWinners(result.winners);

        if (adBannerEnabled && adBannerAsset) {
          setShowAdBanner(true);
        } else {
          revealWinnerPopup();
        }
      }, revealDelayMs);
    }, spinDurationMs);
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <audio ref={spinAudioRef} src={customSpinSound || undefined} preload="auto" />
      <audio ref={winAudioRef} src={customWinSound || undefined} preload="auto" />
      {!isWheelFullscreen && <AdBannerPopup open={showAdBanner} assetUrl={adBannerAsset} onClose={closeAdBannerAndRevealWinners} />}
      {!isWheelFullscreen && <WinnerPopup winners={latestWinners} open={showWinnerPopup} onClose={() => setShowWinnerPopup(false)} />}
      <div className="mx-auto max-w-7xl">
        <header className="mascot-header relative mb-6 overflow-hidden rounded-[2rem] p-5 shadow-soft sm:p-7">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/70" />
          
          <div className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full bg-pink-200/60 blur-2xl" />
          <div className="pointer-events-none absolute right-28 top-4 h-28 w-28 rounded-full bg-[#ed3969]/70 blur-2xl" />
          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex rounded-full bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#ed3969] shadow-sm ring-1 ring-[#fbd1df]">
                🎉 SAPSOFT
              </div>
              <img
            src="/images/mascot-header.png"
            alt="Mascot SpinWheel Seminar"
            className="pointer-events-none absolute bottom-0 right-0 z-0 hidden h-[135px] w-auto select-none object-contain opacity-95 md:block lg:h-[168px]"
          />
              <h1 className="text-4xl font-black tracking-tight text-slate-950 drop-shadow-sm sm:text-5xl">
                Spinwil <span className="text-[#ed3969]">Cihuy</span>
              </h1>
              {/* <p className="mt-3 max-w-xl rounded-2xl bg-white/75 px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur">
                Undi hingga 1000 peserta, pilih 1-10 pemenang per spin, dan hapus pemenang otomatis dari daftar aktif.
              </p> */}
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-black text-slate-700">
                <span className="rounded-full bg-yellow-100 px-3 py-1.5">🐯 Siap undi!</span>
                <span className="rounded-full bg-pink-100 px-3 py-1.5">🐰 Semoga beruntung</span>
                <span className="rounded-full bg-[#ffe5f0] px-3 py-1.5">🐧 Bingung? Tanya kak sapta!</span>
                
              </div>
            </div>
            <div className="flex flex-wrap gap-2 rounded-3xl bg-white/10 p-2 shadow-sm backdrop-blur md:mr-[150px] lg:mr-[5px] lg:mb-[-110px]">
              <button onClick={fullscreenWheel} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#f4a7c0] bg-white px-5 py-3 text-sm font-bold text-[#ad0c45] shadow-sm hover:bg-[#ffe5f0]">
                <Maximize2 size={18} /> Bigwil
              </button>
              <button onClick={fullscreenUi} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#c71756]">
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
              <label className="mb-2 block text-sm font-semibold text-slate-700">Ukuran SpinWheel</label>
              <input
                type="range"
                min={0.7}
                max={1.4}
                step={0.05}
                value={wheelScale}
                onChange={(event) => setWheelScale(Number(event.target.value))}
                className="w-full"
              />
              <div className="mb-4 mt-2 flex items-center justify-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-xl font-black text-slate-700">
                {Math.round(wheelScale * 100)}%
              </div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">Jumlah pemenang per spin</label>
              <input
                type="range"
                min={1}
                max={10}
                value={winnerCount}
                onChange={(event) => setWinnerCount(Number(event.target.value))}
                className="w-full"
              />
              <div className="mb-4 mt-2 text-center text-4xl font-black text-[#ed3969]">{winnerCount}</div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">Durasi spin</label>
              <input
                type="range"
                min={2}
                max={60}
                value={spinDuration}
                onChange={(event) => setSpinDuration(Number(event.target.value))}
                className="w-full"
              />
              <div className="mb-4 mt-2 flex items-center justify-center gap-2 rounded-2xl bg-[#ffe5f0] px-4 py-3 text-xl font-black text-[#ad0c45]">
                {spinDuration} detik
              </div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">Tunda sebelum popup pemenang</label>
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={winnerRevealDelay}
                onChange={(event) => setWinnerRevealDelay(Number(event.target.value))}
                className="w-full"
              />
              <div className="mb-4 mt-2 flex items-center justify-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-xl font-black text-slate-700">
                {winnerRevealDelay} detik
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!soundMuted) stopSpinSound();
                  setSoundMuted((current) => !current);
                }}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"
              >
                {soundMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                {soundMuted ? "Suara FX: Mute" : "Suara FX: Aktif"}
              </button>

              <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="mb-2 text-sm font-black text-slate-700">Custom suara FX</p>
                <label className="mb-2 block cursor-pointer rounded-xl bg-white px-3 py-2 text-center text-xs font-bold text-slate-700 shadow-sm hover:bg-[#ffe5f0]">
                  Upload suara roda berputar
                  <input type="file" accept="audio/*" className="hidden" onChange={(event) => handleCustomSoundUpload(event.target.files?.[0], "spin")} />
                </label>
                <label className="block cursor-pointer rounded-xl bg-white px-3 py-2 text-center text-xs font-bold text-slate-700 shadow-sm hover:bg-[#ffe5f0]">
                  Upload suara pemenang/terompet
                  <input type="file" accept="audio/*" className="hidden" onChange={(event) => handleCustomSoundUpload(event.target.files?.[0], "win")} />
                </label>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => setCustomSpinSound("")} className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-500">Reset spin</button>
                  <button type="button" onClick={() => setCustomWinSound("")} className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-bold text-slate-500">Reset menang</button>
                </div>
              </div>

              <div className="mb-4 rounded-2xl border border-[#f4a7c0] bg-[#fff5fa] p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-800">Popup banner iklan</p>
                    <p className="text-xs font-semibold text-slate-500">Muncul setelah wheel berhenti, sebelum pemenang tampil.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdBannerEnabled((current) => !current)}
                    className={`rounded-full px-3 py-1.5 text-xs font-black ${adBannerEnabled ? "bg-[#ed3969] text-white" : "bg-white text-slate-500 ring-1 ring-slate-200"}`}
                  >
                    {adBannerEnabled ? "Aktif" : "Nonaktif"}
                  </button>
                </div>

                <label className="block cursor-pointer rounded-xl bg-white px-3 py-2 text-center text-xs font-bold text-slate-700 shadow-sm hover:bg-[#ffe5f0]">
                  Upload banner gambar / GIF
                  <input type="file" accept="image/*,.gif" className="hidden" onChange={(event) => handleAdBannerUpload(event.target.files?.[0])} />
                </label>

                {adBannerAsset ? (
                  <div className="mt-3 overflow-hidden rounded-xl border border-white bg-white shadow-sm">
                    <img src={adBannerAsset} alt="Preview banner iklan" className="max-h-28 w-full object-contain" />
                  </div>
                ) : (
                  <p className="mt-2 text-center text-[11px] font-semibold text-slate-500">Belum ada banner. Upload gambar atau GIF terlebih dahulu.</p>
                )}

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setAdBannerAsset("")} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-500">Reset banner</button>
                  <button type="button" onClick={() => setShowAdBanner(adBannerEnabled && Boolean(adBannerAsset))} disabled={!adBannerAsset} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-500 disabled:opacity-40">Preview</button>
                </div>
              </div>

              <button
                onClick={spin}
                disabled={!canSpin}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ed3969] px-5 py-4 text-base font-black text-white shadow-lg shadow-[#f6a7c9] transition hover:bg-[#c71756] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
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
            <div className="bigwil-hide mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-4 xl:grid-cols-4 items-stretch">
              <Stat label="Peserta aktif" value={names.length} />
              <Stat label="Σ pemenang" value={winners.length} />
              <Stat label="Mode spin" value={winnerCount} />
              <Stat label="Durasi" value={`${spinDuration}s`} />
              {/* <Stat label="Mode spin" value={`${winnerCount} nama`} /> */}
            </div>


            <div className="bigwil-wheel-stage">
              <SpinWheel
                names={names}
                spinning={spinning}
                rotation={rotation}
                onSpin={spin}
                spinDurationMs={spinDuration * 1000}
                winnerCount={winnerCount}
                scale={wheelScale}
                currentPassingName={currentPassingName}
              />
            </div>
            {isWheelFullscreen && <AdBannerPopup open={showAdBanner} assetUrl={adBannerAsset} onClose={closeAdBannerAndRevealWinners} />}
            {isWheelFullscreen && <WinnerPopup winners={latestWinners} open={showWinnerPopup} onClose={() => setShowWinnerPopup(false)} />}

            <div className="bigwil-latest-winners mt-6 rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#f091b6]">Pemenang Terbaru</p>
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

            <div className="bigwil-hide mt-5 rounded-3xl bg-white p-5">
              <h2 className="mb-3 text-lg font-bold text-slate-950">Preview Peserta Aktif</h2>
              {participantPreview.length ? (
                <div className="flex flex-wrap gap-2">
                  {participantPreview.map((name) => (
                    <span key={name} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">{name}</span>
                  ))}
                  {names.length > 10 && <span className="rounded-full bg-[#ffe5f0] px-3 py-2 text-xs font-bold text-[#ad0c45]">+{names.length - 10} lainnya</span>}
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
    <div className="rounded-2xl bg-white p-4 text-center shadow-sm h-full flex flex-col items-center justify-center">
      <p className="text-2xl font-black text-slate-950 leading-none">{value}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500 whitespace-nowrap truncate max-w-full">{label}</p>
    </div>
  );
}
