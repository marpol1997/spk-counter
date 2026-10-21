"use client";
import confetti from "canvas-confetti";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ActivityFeed } from "@/components/ActivityFeed";
import { AuthScreen } from "@/components/AuthScreen";
import { Background } from "@/components/Background";
import { Header } from "@/components/Header";
import { PersonCard } from "@/components/PersonCard";
import { supabase } from "@/lib/supabase";
import { useCounters } from "@/hooks/useCounters";
import { useEvents } from "@/hooks/useEvents";
import { HEARTS, MESSAGES, MILESTONES, PEOPLE } from "@/lib/constants";
import type { CounterId, PersonId } from "@/lib/types";
import { randomOf } from "@/lib/utils";

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) setShowAuth(false); // Автоматически закрываем окно входа при успехе
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen bg-[#0a0510]" />;

  return (
    <>
      <MainApp session={session} onLoginClick={() => setShowAuth(true)} />
      {showAuth && <AuthScreen onClose={() => setShowAuth(false)} />}
    </>
  );
}

function MainApp({ session, onLoginClick }: { session: any; onLoginClick: () => void }) {
  const { state, increment, reset } = useCounters();
  const { events, weekTotal } = useEvents(20);

  const email = session?.user?.email || "";
  const currentUserId = email.startsWith("anna") ? "anna" : email.startsWith("valeria") ? "valeria" : null;
  const actor = currentUserId === "anna" ? "Анна" : currentUserId === "valeria" ? "Валерия" : "";
  
  // Красивое имя для отображения
  const displayName = currentUserId === "anna" 
    ? "Анна Васильевна 👑" 
    : currentUserId === "valeria" 
      ? "Валерия Сергеевна 💃" 
      : "Гость 👀";

  const handleIncrement = async (
    pid: PersonId, cid: CounterId, delta: number, e?: React.MouseEvent
  ) => {
    if (!currentUserId || pid !== currentUserId) return;

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
      toast.error("Нет прав или ошибка сети 😢");
    }
  };

  const handleReset = async () => {
    if (!currentUserId) return;
    if (!confirm(`Сбросить карточку ${actor}?`)) return;
    try {
      await reset(currentUserId, actor);
      toast.success(`Карточка ${actor} сброшена! 🌙`);
    } catch {
      toast.error("Не получилось 😢");
    }
  };

  return (
    <>
      <Background />
      <main className="relative min-h-screen pb-24 overflow-x-hidden">
        <Header weekTotal={weekTotal} />
        
        {/* Плашка текущего пользователя */}
        <div className="flex justify-center mt-6 px-4">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <span className="text-sm sm:text-base font-semibold text-bone/60">
              Вы зашли как:
            </span>
            <span className={`text-sm sm:text-base font-bold ${currentUserId ? "text-neon-rose drop-shadow-[0_0_10px_rgba(255,45,149,.8)]" : "text-bone"}`}>
              {displayName}
            </span>
            {!currentUserId && (
              <button 
                onClick={onLoginClick}
                className="ml-2 text-xs bg-neon/20 hover:bg-neon/40 text-neon-rose px-3 py-1 rounded-full transition-colors font-semibold"
              >
                Войти
              </button>
            )}
          </div>
        </div>

        <div className="mx-auto mt-8 sm:mt-10 grid max-w-5xl gap-6 px-4 sm:px-6 md:grid-cols-2">
          {PEOPLE.map((p, i) => (
            <PersonCard
              key={p.id}
              person={p}
              counts={state[p.id]}
              onIncrement={handleIncrement}
              index={i}
              canEdit={p.id === currentUserId}
            />
          ))}
        </div>

        <ActivityFeed events={events} />

        <div className="mt-12 flex flex-col sm:flex-row justify-center px-4 gap-4">
          {currentUserId ? (
            <>
              <button
                onClick={handleReset}
                className="w-full sm:w-auto rounded-full border border-neon/40 bg-black/50 px-6 py-3 sm:py-2.5 text-sm font-display uppercase tracking-widest text-neon-rose backdrop-blur transition-all hover:border-neon hover:bg-black/70 hover:shadow-[0_0_30px_rgba(255,45,149,.5)]"
              >
                🌙 Сбросить мою карточку
              </button>
              <button
                onClick={() => supabase.auth.signOut()}
                className="w-full sm:w-auto rounded-full border border-white/20 bg-black/50 px-6 py-3 sm:py-2.5 text-sm font-display uppercase tracking-widest text-bone/50 backdrop-blur transition-all hover:bg-white/10"
              >
                Выйти
              </button>
            </>
          ) : (
            <button
              onClick={onLoginClick}
              className="w-full sm:w-auto rounded-full border border-neon/40 bg-black/50 px-8 py-3 sm:py-2.5 text-sm font-display uppercase tracking-widest text-neon-rose backdrop-blur transition-all hover:border-neon hover:bg-black/70 hover:shadow-[0_0_30px_rgba(255,45,149,.5)]"
            >
              🔑 Войти для редактирования
            </button>
          )}
        </div>
      </main>
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