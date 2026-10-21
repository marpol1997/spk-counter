"use client";
import { AnimatePresence, motion } from "motion/react";
import type { EventRow, Profile } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

export function ActivityFeed({ events, profiles }: { events: EventRow[]; profiles: Profile[] }) {
  return (
    <section className="mx-auto mt-10 sm:mt-14 max-w-5xl px-4 sm:px-6">
      <div className="rounded-3xl border border-white/10 bg-black/50 p-4 sm:p-6 shadow-[0_20px_80px_-20px_rgba(255,45,149,.4)] backdrop-blur-xl">
        <div className="mb-4 sm:mb-5 flex items-center gap-2 sm:gap-3 border-b border-white/5 pb-3 sm:pb-4">
          <span className="text-lg sm:text-xl">🕯️</span>
          <h3 className="font-display text-lg sm:text-xl font-bold uppercase tracking-widest text-bone">Архив</h3>
        </div>
        <div className="feed-scroll max-h-[22rem] space-y-2 overflow-y-auto pr-1 sm:pr-2">
          {events.length === 0 && <div className="rounded-xl border border-dashed border-white/10 bg-white/[.02] p-5 text-center text-xs sm:text-sm italic text-bone/40">Пока тихо...</div>}
          <AnimatePresence initial={false}>
            {events.map((ev) => {
              const profile = profiles.find(p => p.id === ev.user_id);
              return (
                <motion.div key={ev.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={`flex items-center gap-2 sm:gap-3 rounded-xl border px-2.5 py-2 sm:px-3 sm:py-2.5 ${ev.note === "reset" ? "border-purple-500/30 bg-purple-950/40" : "border-white/5 bg-white/[.03]"}`}>
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-black/50 ring-1 ring-white/10 text-xs">
                    {ev.note === "reset" ? "🌙" : "📌"}
                  </div>
                  <div className="flex-1 text-[10px] sm:text-xs leading-snug text-bone/70">
                    <b className="text-neon-rose">{ev.actor || "Кто-то"}</b>{" "}
                    {ev.note === "reset" ? "сбросил(а) свои счётчики" : (
                      <><span className="tabular-nums text-bone">{ev.delta > 0 ? "+" : ""}{ev.delta}</span> → {profile?.display_name || "Кто-то"}</>
                    )}
                  </div>
                  <div className="shrink-0 whitespace-nowrap text-[8px] sm:text-[10px] font-medium uppercase tracking-widest text-amber/50">{timeAgo(ev.created_at)}</div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}