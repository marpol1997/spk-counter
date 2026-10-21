"use client";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { CounterMeta } from "@/lib/types";

interface Props {
  counter: CounterMeta;
  value: number;
  accent: "pink" | "purple";
  onIncrement: (e: React.MouseEvent) => void;
  onDecrement: () => void;
}

export function CounterRow({ counter, value, accent, onIncrement, onDecrement }: Props) {
  const [bump, setBump] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (value > prev.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBump(true);
      const t = setTimeout(() => setBump(false), 320);
      return () => clearTimeout(t);
    }
    prev.current = value;
  }, [value]);

  const shadow = accent === "pink"
    ? "drop-shadow-[0_0_10px_rgba(255,45,149,.9)]"
    : "drop-shadow-[0_0_10px_rgba(217,70,239,.9)]";

  return (
    <div className="group/row flex items-center gap-2 sm:gap-3 rounded-xl border border-white/5 bg-black/40 px-2.5 py-2 sm:px-3 sm:py-2.5 transition-colors hover:border-neon/30 hover:bg-black/60">
      <span className="text-base sm:text-lg opacity-90 shrink-0">{counter.emoji}</span>
      
      <span className="flex-1 min-w-0 text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-bone/70 leading-tight">
        {counter.label}
      </span>

      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        <button
          onClick={onDecrement}
          aria-label="минус"
          className="row-minus flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full text-base sm:text-lg text-bone/40 transition-all hover:bg-white/10 hover:text-bone active:scale-90"
        >
          −
        </button>

        <motion.span
          animate={bump ? { scale: [1, 1.4, 1] } : {}}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={`min-w-[1.5rem] sm:min-w-[2.4rem] shrink-0 text-center font-serif text-xl sm:text-2xl font-black tabular-nums text-bone ${shadow}`}
        >
          {value}
        </motion.span>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.85 }}
          onClick={(e) => { prev.current = value; onIncrement(e); }}
          aria-label="плюс"
          className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full text-white shadow-lg ${
            accent === "pink"
              ? "bg-gradient-to-br from-neon to-blood shadow-neon/60"
              : "bg-gradient-to-br from-fuchsia-500 to-purple-700 shadow-fuchsia-500/60"
          }`}
        >
          +
        </motion.button>
      </div>
    </div>
  );
}