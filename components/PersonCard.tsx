"use client";
import { motion } from "motion/react";
import { COUNTERS } from "@/lib/constants";
import type { CounterId, Person, PersonId } from "@/lib/types";
import { CounterRow } from "./CounterRow";

interface Props {
  person: Person;
  counts: Record<CounterId, number>;
  onIncrement: (pid: PersonId, cid: CounterId, delta: number, e?: React.MouseEvent) => void;
  index: number;
  canEdit: boolean; // <-- ДОБАВИЛИ
}

export function PersonCard({ person, counts, onIncrement, index, canEdit }: Props) {
  const total = COUNTERS.reduce((s, c) => s + (counts[c.id] ?? 0), 0);
  const isAnna = person.id === "anna";

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: index * 0.15 }}
      className="group relative w-full"
    >
      {/* Убрали -inset-1, теперь свечение ровно по размеру карточки */}
      <div
        className={`absolute inset-0 rounded-[2rem] opacity-40 blur-2xl transition-opacity duration-500 group-hover:opacity-70 ${
          isAnna
            ? "bg-gradient-to-br from-neon via-neon-rose to-blood"
            : "bg-gradient-to-br from-fuchsia-600 via-purple-700 to-neon"
        }`}
      />

      <div className="relative overflow-hidden rounded-[2rem] border border-neon/25 bg-surface/85 backdrop-blur-2xl">
        <div
          className={`h-[2px] w-full ${
            isAnna
              ? "bg-gradient-to-r from-transparent via-neon to-transparent"
              : "bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent"
          }`}
        />

        <span className="pointer-events-none absolute left-3 top-3 text-[10px] text-amber/50">✝</span>
        <span className="pointer-events-none absolute right-3 top-3 text-[10px] text-amber/50">✝</span>

        <div className="p-4 sm:p-7">
          <div className="mb-4 sm:mb-6 flex items-start gap-3 sm:gap-4">
            <div
              className={`relative flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full text-2xl sm:text-3xl shadow-[0_0_40px_-5px] ${
                isAnna
                  ? "bg-gradient-to-br from-neon to-blood shadow-neon/80"
                  : "bg-gradient-to-br from-fuchsia-500 to-purple-700 shadow-fuchsia-500/80"
              }`}
            >
              <span className="absolute inset-0 rounded-full border border-white/20 animate-spin-slow" />
              {person.emoji}
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.35em] text-amber/70">
                {isAnna ? "Queen" : "Valkyrie"}
              </div>
              <h2 className="mt-0.5 sm:mt-1 font-display text-lg sm:text-2xl font-bold uppercase leading-tight tracking-wide text-bone">
                {person.name}
              </h2>
              <p className="mt-1 text-[10px] sm:text-[11px] italic leading-snug text-bone/50">
                {person.title}
              </p>
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            {COUNTERS.map((c) => (
              <CounterRow
    key={c.id}
    counter={c}
    value={counts[c.id] ?? 0}
    accent={isAnna ? "pink" : "purple"}
    onIncrement={(e) => onIncrement(person.id, c.id, 1, e)}
    onDecrement={() => onIncrement(person.id, c.id, -1)}
    canEdit={canEdit} // <-- ДОБАВИЛИ
  />
            ))}
          </div>

          <div className="mt-4 sm:mt-6 flex items-center justify-between rounded-2xl border border-amber/20 bg-gradient-to-r from-black/60 to-blood/20 px-3 py-2 sm:px-4 sm:py-3">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] text-amber/70">
              Итого пережито
            </span>
            <span className="font-serif text-2xl sm:text-3xl font-black tabular-nums text-bone drop-shadow-[0_0_14px_rgba(255,110,199,.8)]">
              {total}
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}