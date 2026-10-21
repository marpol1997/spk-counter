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
import { useDashboard } from "@/hooks/useDashboard";
import { HEARTS, MESSAGES, MILESTONES } from "@/lib/constants";
import { randomOf } from "@/lib/utils";

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingAuth(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) setShowAuth(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loadingAuth) return <div className="min-h-screen bg-[#0a0510]" />;

  return (
    <>
      <MainApp session={session} onLoginClick={() => setShowAuth(true)} />
      {showAuth && <AuthScreen onClose={() => setShowAuth(false)} />}
    </>
  );
}

function MainApp({ session, onLoginClick }: { session: any; onLoginClick: () => void }) {
  const { profiles, counters, events, loading, increment, reset } = useDashboard();
  
  const currentUserId = session?.user?.id;
  const myProfile = profiles.find(p => p.id === currentUserId);
  const actorName = myProfile ? myProfile.display_name : "Гость";

  const handleIncrement = async (counterId: string, delta: number, e?: React.MouseEvent) => {
    if (!currentUserId) return;
    try {
      const counter = counters.find(c => c.id === counterId);
      const newVal = await increment(counterId, delta, actorName);
      
      if (delta > 0 && e) {
        spawnHeart(e.clientX, e.clientY);
        if (Math.random() < 0.35) toast(randomOf(MESSAGES));
        if (counter && (MILESTONES as readonly number[]).includes(newVal)) {
          celebrate();
          toast.success(`🎉 ${newVal}! Это уже легенда!`);
        }
      }
    } catch (err) {
      toast.error("Нет прав или ошибка сети 😢");
    }
  };

  const handleReset = async () => {
    if (!currentUserId) return;
    if (!confirm(`Сбросить все ваши счётчики?`)) return;
    try {
      await reset(actorName);
      toast.success(`Все сброшено! 🌙`);
    } catch {
      toast.error("Не получилось 😢");
    }
  };

  const weekTotal = events.reduce((s, e) => s + (e.note === 'reset' ? 0 : e.delta), 0);

  return (
    <>
      <Background />
      <main className="relative min-h-screen pb-24 overflow-x-hidden">
        <Header weekTotal={weekTotal} />
        
        <div className="flex justify-center mt-6 px-4">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <span className="text-sm sm:text-base font-semibold text-bone/60">Вы зашли как:</span>
            <span className={`text-sm sm:text-base font-bold ${currentUserId ? "text-neon-rose drop-shadow-[0_0_10px_rgba(255,45,149,.8)]" : "text-bone"}`}>
              {myProfile ? `${myProfile.display_name} ${myProfile.emoji}` : "Гость 👀"}
            </span>
            {!currentUserId && (
              <button onClick={onLoginClick} className="ml-2 text-xs bg-neon/20 hover:bg-neon/40 text-neon-rose px-3 py-1 rounded-full transition-colors font-semibold">
                Войти
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center mt-20 text-bone/50 font-display uppercase tracking-widest animate-pulse">Загрузка...</div>
        ) : (
          <div className="mx-auto mt-8 sm:mt-10 grid max-w-5xl gap-6 px-4 sm:px-6 md:grid-cols-2">
            {profiles.map((profile, i) => (
              <PersonCard
                key={profile.id}
                profile={profile}
                counters={counters.filter(c => c.user_id === profile.id)}
                canEdit={profile.id === currentUserId}
                onIncrement={handleIncrement}
                index={i}
                sessionUserId={currentUserId}
              />
            ))}
          </div>
        )}

        <ActivityFeed events={events} profiles={profiles} />

        <div className="mt-12 flex flex-col sm:flex-row justify-center px-4 gap-4">
          {currentUserId ? (
            <>
              <button onClick={handleReset} className="w-full sm:w-auto rounded-full border border-neon/40 bg-black/50 px-6 py-3 sm:py-2.5 text-sm font-display uppercase tracking-widest text-neon-rose backdrop-blur transition-all hover:border-neon hover:bg-black/70 hover:shadow-[0_0_30px_rgba(255,45,149,.5)]">
                🌙 Сбросить мои счётчики
              </button>
              <button onClick={() => supabase.auth.signOut()} className="w-full sm:w-auto rounded-full border border-white/20 bg-black/50 px-6 py-3 sm:py-2.5 text-sm font-display uppercase tracking-widest text-bone/50 backdrop-blur transition-all hover:bg-white/10">
                Выйти
              </button>
            </>
          ) : (
            <button onClick={onLoginClick} className="w-full sm:w-auto rounded-full border border-neon/40 bg-black/50 px-8 py-3 sm:py-2.5 text-sm font-display uppercase tracking-widest text-neon-rose backdrop-blur transition-all hover:border-neon hover:bg-black/70 hover:shadow-[0_0_30px_rgba(255,45,149,.5)]">
              🔑 Войти или Зарегистрироваться
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
  confetti({ particleCount: 160, spread: 110, origin: { y: 0.7 }, colors: ["#ff2d95", "#ff6ec7", "#e8b14a", "#8b0a2a", "#f5e9d7", "#ffffff"], scalar: 1.2 });
}