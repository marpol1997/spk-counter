"use client";
import { AnimatePresence, motion } from "motion/react";
import { COUNTERS, PEOPLE } from "@/lib/constants";
import type { EventRow } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

export function ActivityFeed({ events }: { events: EventRow[] }) {
  return (
    <section className="mx-auto mt-14 max-w-5xl px-6">
      <div className="rounded-3xl border border-white/10 bg-black/50 p-6 shadow-[0_20px_80px_-20px_rgba(255,45,149,.4)] backdrop-blur-xl">
        <div className="mb-5 flex items-center gap-3 border-b border-white/5 pb-4">
          <span className="text-xl">🕯️</span>
          <h3 className="font-display text-xl font-bold uppercase tracking-widest text-bone">
            Архив ритуалов
          </h3>
          <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.3em] text-amber/60">
            последние {events.length}
          </span>
        </div>
        <div className="feed-scroll max-h-[22rem] space-y-2 overflow-y-auto pr-2">
          {events.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/[.02] p-5 text-center text-sm italic text-bone/40">
              Пока тихо... но Теплогаз уже что-то готовит 🌸
            </div>
          )}
          <AnimatePresence initial={false}>
            {events.map((ev) => <FeedItem key={ev.id} event={ev} />)}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function FeedItem({ event }: { event: EventRow }) {
  const isReset = event.note === "reset";
  const person = PEOPLE.find((p) => p.id === event.person_id);
  const counter = COUNTERS.find((c) => c.id === event.counter_id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
        isReset
          ? "border-purple-500/30 bg-purple-950/40"
          : "border-white/5 bg-white/[.03]"
      }`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-neon/30 to-purple-700/30 text-sm ring-1 ring-white/10">
        {isReset ? "🌙" : counter?.emoji ?? "•"}
      </div>
      <div className="flex-1 text-xs leading-snug text-bone/70">
        {isReset ? (
          <>
            🌙 <b className="text-neon-rose">{event.actor ?? "Кто-то"}</b> провёл(а) обнуляющий ритуал
          </>
        ) : (
          <>
            <b className="text-neon-rose">{event.actor ?? "Кто-то"}</b>{" "}
            <span className="tabular-nums text-bone">
              {event.delta > 0 ? "+" : ""}{event.delta}
            </span>{" "}
            → {person?.shortName} · {counter?.label.toLowerCase()}
          </>
        )}
      </div>
      <div className="shrink-0 whitespace-nowrap text-[10px] font-medium uppercase tracking-widest text-amber/50">
        {timeAgo(event.created_at)}
      </div>
    </motion.div>
  );
}