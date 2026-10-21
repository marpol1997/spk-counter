"use client";
import { motion } from "motion/react";
import { WeekStats } from "./WeekStats";

export function Header({ weekTotal }: { weekTotal: number | null }) {
  return (
    <header className="relative z-10 mx-auto max-w-5xl px-6 pt-12 text-center sm:pt-16">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center justify-center gap-3 text-[10px] font-semibold uppercase tracking-[0.5em] text-amber/80"
      >
        <span className="h-px w-10 bg-gradient-to-r from-transparent to-amber/60" />
        <span className="font-display">Ad Inferos · Ad Astra</span>
        <span className="h-px w-10 bg-gradient-to-l from-transparent to-amber/60" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 240, damping: 20 }}
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-neon/40 bg-black/40 text-2xl shadow-[0_0_30px_rgba(255,45,149,.5)] backdrop-blur animate-neon"
      >
        ✝
      </motion.div>

      {/* Заголовок: убрали br, добавили py и leading-normal */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="glitter-text mt-8 py-2 font-display text-4xl font-black uppercase leading-[1.15] tracking-tight sm:text-6xl md:text-7xl"
      >
        <span className="block">Боевой</span>
        <span className="block">счётчик</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mx-auto mt-6 max-w-lg text-sm italic leading-relaxed text-bone/70"
      >
        «Между небом и землёй есть место, где Теплогаз снова прислал претензию.»
        <span className="mt-3 block not-italic text-[10px] uppercase tracking-[0.4em] text-neon-rose/80">
          СПК · живой счётчик
        </span>
      </motion.p>

      <WeekStats total={weekTotal} />
    </header>
  );
}