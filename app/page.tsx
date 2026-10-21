"use client";
import confetti from "canvas-confetti";
import { useState } from "react";
import { toast } from "sonner";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Background } from "@/components/Background";
import { Header } from "@/components/Header";
import { NameModal } from "@/components/NameModal";
import { PersonCard } from "@/components/PersonCard";
import { useActor } from "@/hooks/useActor";
import { useCounters } from "@/hooks/useCounters";
import { useEvents } from "@/hooks/useEvents";
import { HEARTS, MESSAGES, MILESTONES, PEOPLE } from "@/lib/constants";
import type { CounterId, PersonId } from "@/lib/types";
import { randomOf } from "@/lib/utils";

export default function Home() {
  const { actor, setActor, loaded } = useActor();
  const { state, increment, reset } = useCounters();
  const { events, weekTotal } = useEvents(20);
  const [nameModalOpen, setNameModalOpen] = useState(false);

  const handleIncrement = async (
    pid: PersonId, cid: CounterId, delta: number, e?: React.MouseEvent
  ) => {
    if (!actor) { setNameModalOpen(true); return; }
    try {
      const newVal = await increment(pid, cid, delta, actor);
      if (delta > 0 && e) {
        spawnHeart(e.clientX, e.clientY);
        if (Math.random() < 0.35) toast(randomOf(MESSAGES));
        if ((MILESTONES as readonly number[]).includes(newVal)) {
          celebrate();
          toast.success(`🎉 ${newVal}! Это уже легенда!`);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Не удалось сохранить 😢");
    }
  };

  const handleReset = async () => {
    if (!actor) { setNameModalOpen(true); return; }
    if (!confirm("Сбросить все счётчики для всех?")) return;
    try {
      await reset(actor);
      toast.success("Всё сброшено! 🌙");
    } catch {
      toast.error("Не получилось 😢");
    }
  };

  return (
    <>
      <Background />

      {/* Добавили overflow-x-hidden, чтобы айфон не сдвигал контент вправо */}
      <main className="relative min-h-screen pb-24 overflow-x-hidden">
        <Header weekTotal={weekTotal} />

        <div className="mx-auto mt-10 sm:mt-14 grid max-w-5xl gap-6 px-4 sm:px-6 md:grid-cols-2">
          {PEOPLE.map((p, i) => (
            <PersonCard
              key={p.id}
              person={p}
              counts={state[p.id]}
              onIncrement={handleIncrement}
              index={i}
            />
          ))}
        </div>

        <ActivityFeed events={events} />

        <div className="mt-12 flex justify-center px-4">
          <button
            onClick={handleReset}
            className="w-full sm:w-auto rounded-full border border-neon/40 bg-black/50 px-6 py-3 sm:py-2.5 text-sm font-display uppercase tracking-widest text-neon-rose backdrop-blur transition-all hover:border-neon hover:bg-black/70 hover:shadow-[0_0_30px_rgba(255,45,149,.5)]"
          >
            🌙 Обнулить ритуалом
          </button>
        </div>
      </main>

      <NameModal
        open={loaded && (nameModalOpen || !actor)}
        onSave={(n) => {
          setActor(n);
          setNameModalOpen(false);
          toast.success(`Привет, ${n}! 💖`);
        }}
      />
    </>
  );
}

function spawnHeart(x: number, y: number) {
  const el = document.createElement("div");
  el.textContent = randomOf(HEARTS);
  el.style.cssText = `position:fixed;left:${x - 12}px;top:${y - 12}px;font-size:22px;pointer-events:none;z-index:9999;animation:floatUp 1.2s ease-out forwards`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

function celebrate() {
  confetti({
    particleCount: 160,
    spread: 110,
    origin: { y: 0.7 },
    colors: ["#ff2d95", "#ff6ec7", "#e8b14a", "#8b0a2a", "#f5e9d7", "#ffffff"],
    scalar: 1.2,
  });
}