"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface Props {
  open: boolean;
  onSave: (name: string) => void;
}

export function NameModal({ open, onSave }: Props) {
  const [name, setName] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => ref.current?.focus(), 150);
  }, [open]);

  const submit = () => {
    const v = name.trim().slice(0, 20);
    if (v) onSave(v);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-neon/30 bg-surface p-7 shadow-[0_0_60px_-10px_rgba(255,45,149,.6)]"
          >
            <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-neon to-transparent" />
            <div className="text-center text-4xl">✝</div>
            <h2 className="mt-3 text-center font-display text-2xl uppercase tracking-widest text-bone">
              Кто вызывающий?
            </h2>
            <p className="mt-2 text-center text-[11px] italic leading-relaxed text-bone/50">
              Имя появится в архиве ритуалов — чтобы все видели, кто жмёт «+»
            </p>
            <input
              ref={ref}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              maxLength={20}
              placeholder="например, Аня"
              className="mt-5 w-full rounded-xl border-2 border-white/10 bg-black/50 px-4 py-3 text-center text-base text-bone placeholder-bone/30 outline-none transition-colors focus:border-neon/60 focus:shadow-[0_0_20px_rgba(255,45,149,.4)]"
            />
            <button
              onClick={submit}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-neon to-blood py-3 font-display uppercase tracking-widest text-white shadow-[0_0_30px_rgba(255,45,149,.5)] transition-transform hover:scale-[1.02] active:scale-95"
            >
              Войти 💫
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}