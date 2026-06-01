import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Pause, RotateCcw, RotateCw, Settings, Lock, PictureInPicture2, Subtitles, Volume2, Gauge, Sun, Unlock } from "lucide-react";
import { tmdb, IMG, getTitle } from "@/lib/tmdb";
import { BottomSheet, OptionList } from "@/components/kino/BottomSheet";
import { useApp } from "@/lib/store";
import { toast } from "sonner";

type Sheet = null | "audio" | "subs" | "quality" | "speed";

export function Player() {
  const router = useRouter();
  const { type, id } = useParams({ from: "/player/$type/$id" });
  const { settings, setSetting } = useApp();
  const [meta, setMeta] = useState<any>(null);
  const [state, setState] = useState<"loading" | "playing" | "paused" | "buffering">("loading");
  const [currentTime, setCurrentTime] = useState(0);
  const duration = 7200; // 2h fake
  const [controlsVisible, setControlsVisible] = useState(true);
  const [locked, setLocked] = useState(false);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [speed, setSpeed] = useState("1");
  const [overlay, setOverlay] = useState<{ kind: "brightness" | "volume" | "seek"; value: number; delta?: number } | null>(null);
  const [brightness, setBrightness] = useState(0.8);
  const [volume, setVolume] = useState(0.7);
  const [ripple, setRipple] = useState<{ x: number; y: number; dir: "back" | "fwd"; id: number } | null>(null);

  const hideTimer = useRef<number | null>(null);
  const tapTimer = useRef<number | null>(null);
  const lastTap = useRef<{ time: number; zone: "left" | "right"; x: number; y: number } | null>(null);
  const overlayTimer = useRef<number | null>(null);
  const dragStart = useRef<{ x: number; y: number; t: number; mode?: "v" | "h" | "seek" } | null>(null);

  useEffect(() => {
    tmdb(`/${type === "anime" ? "tv" : type}/${id}`).then((d) => {
      setMeta(d);
      setState("playing");
    });
  }, [type, id]);

  // playback ticking
  useEffect(() => {
    if (state !== "playing") return;
    const i = window.setInterval(() => {
      setCurrentTime((t) => Math.min(duration, t + parseFloat(speed)));
    }, 1000);
    return () => clearInterval(i);
  }, [state, speed]);

  // auto-hide controls
  const resetHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setControlsVisible(true);
    if (state === "playing") {
      hideTimer.current = window.setTimeout(() => setControlsVisible(false), 3000);
    }
  };
  useEffect(() => { resetHide(); /* eslint-disable-next-line */ }, [state]);

  const showOverlay = (kind: "brightness" | "volume" | "seek", value: number, delta?: number) => {
    setOverlay({ kind, value, delta });
    if (overlayTimer.current) clearTimeout(overlayTimer.current);
    overlayTimer.current = window.setTimeout(() => setOverlay(null), 1500);
  };

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (locked) return;
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const clientX = "touches" in e ? (e.changedTouches[0]?.clientX ?? 0) : e.clientX;
    const clientY = "touches" in e ? (e.changedTouches[0]?.clientY ?? 0) : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const zone: "left" | "right" = x < rect.width / 2 ? "left" : "right";
    const now = Date.now();

    if (lastTap.current && now - lastTap.current.time < 300 && lastTap.current.zone === zone) {
      // DOUBLE TAP
      if (tapTimer.current) clearTimeout(tapTimer.current);
      lastTap.current = null;
      const dir = zone === "left" ? "back" : "fwd";
      setCurrentTime((t) => Math.max(0, Math.min(duration, t + (dir === "fwd" ? 10 : -10))));
      const rid = Math.random();
      setRipple({ x, y, dir, id: rid });
      window.setTimeout(() => setRipple((r) => (r?.id === rid ? null : r)), 600);
      return;
    }

    lastTap.current = { time: now, zone, x, y };
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = window.setTimeout(() => {
      setControlsVisible((v) => !v);
      if (state === "playing") resetHide();
      lastTap.current = null;
    }, 220);
  };

  // Gestures
  const onTouchStart = (e: React.TouchEvent) => {
    if (locked) return;
    const t = e.touches[0];
    dragStart.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (locked || !dragStart.current) return;
    const t = e.touches[0];
    const dx = t.clientX - dragStart.current.x;
    const dy = t.clientY - dragStart.current.y;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (!dragStart.current.mode) {
      if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        const cx = dragStart.current.x - rect.left;
        const inCenter = cx > rect.width * 0.3 && cx < rect.width * 0.7;
        dragStart.current.mode = inCenter ? "seek" : "h";
      } else {
        const cx = dragStart.current.x - rect.left;
        dragStart.current.mode = cx < rect.width / 2 ? "v" : "h";
      }
    }
    if (dragStart.current.mode === "v") {
      const nb = Math.max(0, Math.min(1, brightness - dy / 300));
      setBrightness(nb);
      showOverlay("brightness", nb);
    } else if (dragStart.current.mode === "h") {
      const cx = dragStart.current.x - rect.left;
      if (cx < rect.width / 2) {
        const nb = Math.max(0, Math.min(1, brightness - dy / 300));
        setBrightness(nb); showOverlay("brightness", nb);
      } else {
        const nv = Math.max(0, Math.min(1, volume - dy / 300));
        setVolume(nv); showOverlay("volume", nv);
      }
    } else if (dragStart.current.mode === "seek") {
      const seekDelta = (dx / rect.width) * duration * 0.3;
      showOverlay("seek", currentTime + seekDelta, seekDelta);
    }
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (locked || !dragStart.current) return;
    if (dragStart.current.mode === "seek") {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const dx = (e.changedTouches[0]?.clientX ?? 0) - dragStart.current.x;
      const seekDelta = (dx / rect.width) * duration * 0.3;
      setCurrentTime((t) => Math.max(0, Math.min(duration, t + seekDelta)));
    }
    dragStart.current = null;
  };

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
    return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${m}:${String(sec).padStart(2, "0")}`;
  };

  const goBack = () => router.history.back();

  const pip = async () => {
    try {
      // @ts-ignore
      if (document.pictureInPictureEnabled) toast.info("PiP requested");
      else toast.error("PiP not supported on this device");
    } catch { toast.error("PiP not supported on this device"); }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden touch-none select-none" style={{ filter: `brightness(${0.3 + brightness * 0.7})` }}>
      {/* Backdrop / video stand-in */}
      <div className="absolute inset-0">
        {meta?.backdrop_path && (
          <img src={IMG(meta.backdrop_path, "w1280")} alt="" className="w-full h-full object-cover opacity-90" />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Gesture surface */}
      <div className="absolute inset-0" onClick={handleTap} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} />

      {/* Ripple for double-tap seek */}
      <AnimatePresence>
        {ripple && (
          <motion.div
            className="absolute pointer-events-none"
            style={{ left: ripple.x - 60, top: ripple.y - 60, width: 120, height: 120 }}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 1.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-full h-full rounded-full bg-white/30 flex items-center justify-center">
              <div className="flex flex-col items-center text-white">
                {ripple.dir === "back" ? <RotateCcw className="w-8 h-8" /> : <RotateCw className="w-8 h-8" />}
                <span className="font-mono text-xs mt-1">{ripple.dir === "back" ? "-10s" : "+10s"}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gesture overlay */}
      <AnimatePresence>
        {overlay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute top-1/2 -translate-y-1/2 glass-dark rounded-2xl px-5 py-3 pointer-events-none flex items-center gap-3"
            style={ overlay.kind === "brightness" ? { left: 24 } : overlay.kind === "volume" ? { right: 24 } : { left: "50%", transform: "translate(-50%,-50%)" } }
          >
            {overlay.kind === "brightness" && <><Sun className="w-5 h-5 text-white" /><div className="w-24 h-1 bg-white/20 rounded-full"><div className="h-full bg-white rounded-full" style={{ width: `${overlay.value * 100}%` }} /></div></>}
            {overlay.kind === "volume" && <><Volume2 className="w-5 h-5 text-white" /><div className="w-24 h-1 bg-white/20 rounded-full"><div className="h-full bg-white rounded-full" style={{ width: `${overlay.value * 100}%` }} /></div></>}
            {overlay.kind === "seek" && <span className="font-mono text-white">{(overlay.delta ?? 0) >= 0 ? "→ +" : "← "}{Math.abs(Math.round(overlay.delta ?? 0))}s</span>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading spinner */}
      {state === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-[var(--theme-primary)] animate-spin" />
        </div>
      )}

      {/* Lock overlay */}
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button onClick={(e) => { e.stopPropagation(); setLocked(false); resetHide(); }}
            className="pointer-events-auto w-14 h-14 rounded-full glass-dark flex items-center justify-center btn-press">
            <Lock className="w-6 h-6 text-white" />
          </button>
        </div>
      )}

      {/* Controls */}
      <AnimatePresence>
        {controlsVisible && !locked && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top bar */}
            <div className="pointer-events-auto flex items-center gap-3 p-4 bg-gradient-to-b from-black/80 to-transparent">
              <button
                onClick={goBack}
                aria-label="Back"
                className="w-12 h-12 rounded-full glass-dark flex items-center justify-center btn-press"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <p className="flex-1 text-white font-medium truncate">{meta ? getTitle(meta) : "Loading…"}</p>
              <button onClick={() => toast.info("Settings")} className="w-12 h-12 rounded-full glass-dark flex items-center justify-center btn-press">
                <Settings className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Center */}
            <div className="flex items-center justify-center gap-8">
              <button onClick={() => { setCurrentTime((t) => Math.max(0, t - 10)); resetHide(); }} className="pointer-events-auto w-11 h-11 rounded-full glass-dark flex items-center justify-center btn-press">
                <RotateCcw className="w-5 h-5 text-white" />
              </button>
              <button onClick={() => { setState(state === "playing" ? "paused" : "playing"); resetHide(); }}
                className="pointer-events-auto w-16 h-16 rounded-full bg-[var(--theme-primary)] flex items-center justify-center btn-press"
                style={{ boxShadow: "0 8px 30px var(--theme-glow)" }}
              >
                {state === "playing" ? <Pause className="w-7 h-7 text-white fill-white" /> : <Play className="w-7 h-7 text-white fill-white ml-1" />}
              </button>
              <button onClick={() => { setCurrentTime((t) => Math.min(duration, t + 10)); resetHide(); }} className="pointer-events-auto w-11 h-11 rounded-full glass-dark flex items-center justify-center btn-press">
                <RotateCw className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Bottom */}
            <div className="pointer-events-auto p-4 bg-gradient-to-t from-black/80 to-transparent">
              {(type === "tv" || type === "anime") && (
                <button onClick={() => toast.info("Next episode")} className="mb-3 ml-auto block px-3 py-1.5 rounded-full glass text-white text-xs btn-press">Skip Intro →</button>
              )}
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-xs text-white">{fmt(currentTime)}</span>
                <input
                  type="range" min={0} max={duration} value={currentTime}
                  onChange={(e) => { setCurrentTime(parseFloat(e.target.value)); resetHide(); }}
                  className="flex-1 accent-[var(--theme-primary)]"
                />
                <span className="font-mono text-xs text-white/70">{fmt(duration)}</span>
              </div>
              <div className="flex items-center justify-around">
                <button onClick={() => setSheet("subs")} className="p-2 btn-press"><Subtitles className="w-5 h-5 text-white" /></button>
                <button onClick={() => setSheet("audio")} className="p-2 btn-press"><Volume2 className="w-5 h-5 text-white" /></button>
                <button onClick={() => setSheet("quality")} className="p-2 text-white text-xs font-bold btn-press">HD</button>
                <button onClick={() => setSheet("speed")} className="p-2 text-white text-xs font-bold btn-press">{speed}x</button>
                <button onClick={pip} className="p-2 btn-press"><PictureInPicture2 className="w-5 h-5 text-white" /></button>
                <button onClick={() => setLocked(true)} className="p-2 btn-press"><Unlock className="w-5 h-5 text-white" /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomSheet open={sheet === "audio"} onClose={() => setSheet(null)} title="Audio Language">
        <OptionList value={settings.audio} onChange={(v) => { setSetting("audio", v); setSheet(null); toast.success(`Audio: ${v}`); }}
          options={[
            { label: "🇮🇳 Hindi", value: "Hindi" },
            { label: "🇬🇧 English", value: "English" },
            { label: "🇯🇵 Japanese (Original)", value: "Japanese" },
            { label: "🇮🇳 Tamil", value: "Tamil" },
            { label: "🇮🇳 Telugu", value: "Telugu" },
          ]} />
      </BottomSheet>
      <BottomSheet open={sheet === "subs"} onClose={() => setSheet(null)} title="Subtitles">
        <OptionList value={settings.subLang} onChange={(v) => setSetting("subLang", v)}
          options={[{ label: "Off", value: "Off" }, { label: "🇬🇧 English", value: "English" }, { label: "🇮🇳 Hindi", value: "Hindi" }, { label: "Auto", value: "Auto" }]} />
        <div className="mt-4">
          <p className="text-white/60 text-xs mb-2">Size</p>
          <div className="flex gap-2">
            {["Small", "Medium", "Large"].map(s => (
              <button key={s} onClick={() => setSetting("subSize", s)} className={`flex-1 py-2 rounded-lg text-sm ${settings.subSize === s ? "bg-[var(--theme-primary)] text-white" : "bg-white/5 text-white/70"}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-white/60 text-xs mb-2">Background</p>
          <div className="flex gap-2">
            {["None", "Box", "Blur"].map(s => (
              <button key={s} onClick={() => setSetting("subBg", s)} className={`flex-1 py-2 rounded-lg text-sm ${settings.subBg === s ? "bg-[var(--theme-primary)] text-white" : "bg-white/5 text-white/70"}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="mt-4 p-4 rounded-lg bg-black/40 text-center">
          <span className={`inline-block ${settings.subBg === "Box" ? "bg-black/80 px-2 py-1" : settings.subBg === "Blur" ? "backdrop-blur bg-black/30 px-2 py-1 rounded" : ""} text-white ${settings.subSize === "Small" ? "text-xs" : settings.subSize === "Large" ? "text-lg" : "text-sm"}`}>
            Sample subtitle text
          </span>
        </div>
      </BottomSheet>
      <BottomSheet open={sheet === "quality"} onClose={() => setSheet(null)} title="Quality">
        <OptionList value={settings.quality} onChange={(v) => { setSetting("quality", v); setSheet(null); }}
          options={["Auto", "1080p", "720p", "480p", "360p"].map(v => ({ label: v === "Auto" ? "Auto (recommended)" : v, value: v }))} />
      </BottomSheet>
      <BottomSheet open={sheet === "speed"} onClose={() => setSheet(null)} title="Playback Speed">
        <OptionList value={speed} onChange={(v) => { setSpeed(v); setSheet(null); }}
          options={["0.5", "0.75", "1", "1.25", "1.5", "2"].map(v => ({ label: v === "1" ? "1x (Normal)" : `${v}x`, value: v }))} />
      </BottomSheet>
    </div>
  );
}
