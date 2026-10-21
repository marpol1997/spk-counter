"use client";
import { motion } from "motion/react";

export function WeekStats({ total }: { total: number | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 22 }}
      className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-neon/30 bg-black/40 px-5 py-3 shadow-[0_0_40px_-10px_rgba(255,45,149,.6)] backdrop-blur-xl"
    >
      <span className="text-2xl">🩸</span>
      <div className="text-left">
        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber/80">За 7 дней</div>
        <div className="font-serif text-xl font-bold text-neon-rose drop-shadow-[0_0_12px_rgba(255,45,149,.9)]">
          {total === null ? "…" : total}{" "}
          <span className="text-[10px] font-medium uppercase tracking-widest text-bone/60">инцидентов</span>
        </div>
      </div>
    </motion.div>
  );
}