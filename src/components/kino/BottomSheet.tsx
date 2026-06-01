import { motion, AnimatePresence } from "framer-motion";
import { type ReactNode, useEffect } from "react";

export function BottomSheet({
  open, onClose, title, children,
}: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[101] bg-[var(--kino-elevated)] rounded-t-3xl max-h-[85vh] overflow-y-auto safe-bottom"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.2}
            onDragEnd={(_, info) => { if (info.offset.y > 100) onClose(); }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>
            {title && (
              <h3 className="px-5 pt-2 pb-3 font-display text-lg text-white">{title}</h3>
            )}
            <div className="px-5 pb-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function OptionList({
  options, value, onChange,
}: { options: { label: string; value: string; icon?: ReactNode }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors text-left btn-press"
        >
          <span className="flex items-center gap-3 text-white">
            {o.icon}<span>{o.label}</span>
          </span>
          {value === o.value && (
            <span className="text-[var(--theme-primary)] text-lg">✓</span>
          )}
        </button>
      ))}
    </div>
  );
}
