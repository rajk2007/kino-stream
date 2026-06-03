import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function SplashScreen({ onDone, quick }: { onDone: () => void; quick?: boolean }) {
  useEffect(() => {
    const t = setTimeout(onDone, quick ? 800 : 3200);
    return () => clearTimeout(t);
  }, [onDone, quick]);

  if (quick) {
    // Returning visit: only Phase 2 + Phase 3 (K slam + sweep), 0.8s
    return (
      <motion.div
        className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative">
          <motion.span
            className="font-display block text-white relative"
            style={{
              fontSize: 88,
              lineHeight: 1,
              textShadow: "0 0 80px rgba(229,9,20,0.9), 0 0 160px rgba(229,9,20,0.4)",
            }}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            K
          </motion.span>
          <motion.div
            className="absolute pointer-events-none"
            style={{
              top: "-10%",
              left: 0,
              width: 20,
              height: "120%",
              background: "rgba(255,255,255,0.6)",
              filter: "blur(8px)",
            }}
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 0.5, delay: 0.1, ease: "linear" }}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
      initial={{ backgroundColor: "#000000" }}
      animate={{ backgroundColor: "#080808" }}
      transition={{ duration: 0.4, delay: 2.8 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative flex flex-col items-center">
        <div className="flex items-baseline" style={{ gap: 2 }}>
          {/* K — Phase 2: slam */}
          <div className="relative">
            <motion.span
              className="font-display block text-white"
              style={{ fontSize: 88, lineHeight: 1 }}
              initial={{ y: -8, opacity: 0, textShadow: "0 0 0px rgba(229,9,20,0)" }}
              animate={{
                y: 0,
                opacity: 1,
                textShadow: [
                  "0 0 0px rgba(229,9,20,0)",
                  "0 0 80px rgba(229,9,20,0.9), 0 0 160px rgba(229,9,20,0.4)",
                  "0 0 80px rgba(229,9,20,0.9), 0 0 160px rgba(229,9,20,0.4)",
                  "0 0 104px rgba(229,9,20,1), 0 0 208px rgba(229,9,20,0.5)",
                  "0 0 80px rgba(229,9,20,0.9), 0 0 160px rgba(229,9,20,0.4)",
                ],
              }}
              transition={{
                y: { duration: 0.08, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
                opacity: { duration: 0.08, delay: 0.3 },
                textShadow: { duration: 3.0, delay: 0.38, times: [0, 0.05, 0.7, 0.85, 1] },
              }}
            >
              K
            </motion.span>
            {/* Phase 2: white flash pulse */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 60%)", transform: "scale(2)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.15, 0] }}
              transition={{ duration: 0.12, delay: 0.38 }}
            />
            {/* Phase 3: light sweep */}
            <motion.div
              className="absolute pointer-events-none"
              style={{
                top: "-10%",
                left: 0,
                width: 20,
                height: "120%",
                background: "rgba(255,255,255,0.6)",
                filter: "blur(8px)",
              }}
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: ["-100%", "-100%", "200%"], opacity: [0, 1, 1] }}
              transition={{ duration: 0.6, delay: 0.8, times: [0, 0.05, 1], ease: "linear" }}
            />
          </div>

          {/* I N O — Phase 4 */}
          {["I", "N", "O"].map((l, i) => (
            <motion.span
              key={l}
              className="font-display block text-white"
              style={{
                fontSize: 88,
                lineHeight: 1,
                textShadow: "0 0 80px rgba(229,9,20,0.9), 0 0 160px rgba(229,9,20,0.4)",
              }}
              initial={{ x: 12, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.2, delay: 1.1 + i * 0.09, ease: "easeOut" }}
            >
              {l}
            </motion.span>
          ))}
        </div>

        {/* Phase 5: separator line */}
        <motion.div
          style={{ height: 1, background: "#E50914", opacity: 0.8, marginTop: 16, boxShadow: "0 0 8px #E50914" }}
          initial={{ width: 0 }}
          animate={{ width: 160 }}
          transition={{ duration: 0.4, delay: 1.6, ease: "easeOut" }}
        />

        {/* Phase 6: creator credit */}
        <motion.p
          style={{
            marginTop: 14,
            fontFamily: "DM Sans, sans-serif",
            fontSize: 11,
            letterSpacing: "0.4em",
            color: "rgba(255,255,255,0.45)",
          }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.9, ease: "easeOut" }}
        >
          by Raj Karmakar
        </motion.p>
        <motion.p
          style={{
            marginTop: 8,
            fontFamily: "DM Sans, sans-serif",
            fontSize: 9,
            letterSpacing: "0.6em",
            color: "rgba(255,255,255,0.2)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 2.1 }}
        >
          CINEMA. REDEFINED.
        </motion.p>
      </div>
    </motion.div>
  );
}

export function RepoInstaller({ onDone }: { onDone: () => void }) {
  const repos = [
    { name: "Mega Repository", shortcode: "megarepo" },
    { name: "CloudStream Providers", shortcode: "cspr" },
    { name: "Phisher Repo", shortcode: "phisherrepo" },
    { name: "Megix Repo", shortcode: "csx" },
  ];
  const [progress, setProgress] = useState<number[]>([0, 0, 0, 0]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timers: number[] = [];
    repos.forEach((_, i) => {
      const startDelay = i * 600;
      timers.push(window.setTimeout(() => {
        const step = window.setInterval(() => {
          setProgress(prev => {
            const np = [...prev];
            np[i] = Math.min(100, np[i] + 10);
            if (np[i] >= 100) clearInterval(step);
            return np;
          });
        }, 80);
        timers.push(step);
      }, startDelay));
    });
    timers.push(window.setTimeout(() => setDone(true), repos.length * 600 + 1000));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[150] bg-[#080808] flex flex-col px-6 pt-16 pb-8 overflow-y-auto"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-white">Setting Up Kino</h1>
          <p className="text-[var(--kino-muted)] text-sm mt-2">Installing content sources for the best streaming experience</p>
        </div>

        <div className="flex flex-col gap-4">
          {repos.map((r, i) => (
            <div key={r.shortcode} className="bg-[var(--kino-card)] rounded-2xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-white font-semibold text-sm">{r.name}</p>
                  <span className="font-mono text-[10px] glass px-2 py-0.5 rounded mt-1 inline-block text-[var(--kino-muted)]">{r.shortcode}</span>
                </div>
                {progress[i] >= 100 && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[#00BFA5] text-xl">✓</motion.div>
                )}
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-accent)]"
                  style={{ width: `${progress[i]}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>
          ))}
        </div>

        {done && (
          <motion.div className="mt-8 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[#00BFA5] mb-6">✓ All sources ready. Welcome to Kino.</p>
            <button onClick={onDone}
              className="w-full h-13 py-4 bg-[var(--theme-primary)] text-white font-semibold rounded-full btn-press"
              style={{ boxShadow: "0 8px 30px var(--theme-glow)" }}
            >Start Watching</button>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
