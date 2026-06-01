import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

export function SplashScreen({ onDone, quick }: { onDone: () => void; quick?: boolean }) {
  const particles = useMemo(
    () => Array.from({ length: 50 }, (_, i) => ({
      id: i,
      color: ["#E50914", "#7B2FBE", "#C2185B"][Math.floor(Math.random() * 3)],
      size: 2 + Math.random() * 3,
      angle: Math.random() * Math.PI * 2,
      dist: 200 + Math.random() * 300,
      delay: Math.random() * 0.3,
    })),
    []
  );

  useEffect(() => {
    const t = setTimeout(onDone, quick ? 800 : 4000);
    return () => clearTimeout(t);
  }, [onDone, quick]);

  const letters = ["K", "I", "N", "O"];

  return (
    <motion.div className="fixed inset-0 z-[200] bg-[#080808] flex items-center justify-center overflow-hidden" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
      {!quick && particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size, height: p.size, background: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
            left: "50%", top: "50%",
          }}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{
            x: Math.cos(p.angle) * p.dist,
            y: Math.sin(p.angle) * p.dist,
            opacity: 0,
          }}
          transition={{ duration: 1, delay: p.delay, ease: "easeOut" }}
        />
      ))}

      {!quick && (
        <>
          <motion.div className="absolute left-0 right-0 h-px bg-white/70" style={{ filter: "blur(12px)", top: "50%" }}
            initial={{ scaleX: 0, transformOrigin: "left" }}
            animate={{ scaleX: [0, 1, 1], transformOrigin: ["left", "left", "right"] }}
            transition={{ duration: 0.5, delay: 0.8 }}
          />
          <motion.div className="absolute top-0 bottom-0 w-px bg-white/40" style={{ filter: "blur(12px)", left: "50%" }}
            initial={{ scaleY: 0, transformOrigin: "top" }}
            animate={{ scaleY: [0, 1, 1] }}
            transition={{ duration: 0.5, delay: 1.0 }}
          />
        </>
      )}

      <div className="relative flex flex-col items-center">
        <motion.div
          className="flex gap-0.5"
          animate={!quick ? { scale: [1, 1.02, 1] } : undefined}
          transition={{ duration: 0.8, delay: 3.0 }}
        >
          {letters.map((l, i) => (
            <motion.span
              key={l}
              className="font-display text-[72px] font-bold text-white text-glow-red leading-none"
              initial={{ opacity: 0, y: i === 0 ? 0 : 30, scale: i === 0 ? 3 : 1, filter: i === 0 ? "blur(20px)" : "blur(0px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              transition={
                quick
                  ? { duration: 0.4, delay: i * 0.05 }
                  : i === 0
                    ? { duration: 0.9, delay: 1.2, type: "spring", stiffness: 120 }
                    : { duration: 0.4, delay: 1.6 + i * 0.08 }
              }
            >
              {l}
            </motion.span>
          ))}
        </motion.div>

        <motion.div className="h-px bg-[#E50914] mt-3"
          initial={{ width: 0 }} animate={{ width: 140 }}
          transition={{ duration: 0.5, delay: quick ? 0.3 : 2.1 }}
          style={{ boxShadow: "0 0 12px #E50914" }}
        />

        {!quick && (
          <>
            <motion.p className="mt-4 text-[#8a8a8a] text-[13px]" style={{ letterSpacing: "0.3em" }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 2.4 }}
            >by Raj Karmakar</motion.p>
            <motion.p className="mt-2 text-[10px] text-white/20" style={{ letterSpacing: "0.5em" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 2.7 }}
            >PREMIUM ENTERTAINMENT</motion.p>
          </>
        )}
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
        }, 80));
        timers.push(step);
      }, startDelay));
    });
    timers.push(window.setTimeout(() => setDone(true), repos.length * 600 + 1000));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
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
  );
}
