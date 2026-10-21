"use client";
import { motion } from "motion/react";

const SPARKS = ["✦","✧","🌸","✝","💖","⭐","✞"];

export function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden grain">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1a0b26_0%,#0a0510_55%,#050008_100%)]" />

      <div className="animate-drift absolute -left-40 top-0 h-[46rem] w-[46rem] rounded-full bg-[radial-gradient(circle,rgba(255,45,149,.28),transparent_65%)] blur-3xl" />
      <div className="animate-drift absolute -right-40 top-20 h-[44rem] w-[44rem] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,.25),transparent_65%)] blur-3xl [animation-delay:-9s]" />
      <div className="animate-drift absolute bottom-0 left-1/3 h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgba(232,177,74,.15),transparent_65%)] blur-3xl [animation-delay:-18s]" />

      <svg
        viewBox="0 0 200 200"
        className="animate-spin-slow absolute left-1/2 top-1/2 h-[85vmin] w-[85vmin] -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
      >
        <circle cx="100" cy="100" r="92" fill="none" stroke="#ff2d95" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="86" fill="none" stroke="#ff2d95" strokeWidth="0.3" strokeDasharray="2 4" />
        <polygon
          points="100,20 147,168 22,74 178,74 53,168"
          fill="none" stroke="#ff6ec7" strokeWidth="0.6"
        />
      </svg>

      {Array.from({ length: 22 }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0.15 }}
          animate={{ opacity: [0.15, 0.55, 0.15] }}
          transition={{ duration: 4 + (i % 6), repeat: Infinity, delay: i * 0.35 }}
          className="absolute select-none text-sm text-neon-rose"
          style={{ left: `${(i * 41) % 97}%`, top: `${(i * 61) % 94}%` }}
        >
          {SPARKS[i % SPARKS.length]}
        </motion.span>
      ))}

      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/80 to-transparent" />
    </div>
  );
}