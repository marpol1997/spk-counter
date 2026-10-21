"use client";
import confetti from "canvas-confetti";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { toPng } from "html-to-image"; // <-- БИБЛИОТЕКА ДЛЯ КАРТИНОК
import { ActivityFeed } from "@/components/ActivityFeed";
import { AuthScreen } from "@/components/AuthScreen";
import { Background } from "@/components/Background";
import { Header } from "@/components/Header";
import { PersonCard } from "@/components/PersonCard";
import { FloatingChat } from "@/components/FloatingChat";
import { StatsChart } from "@/components/StatsChart"; // <-- ГРАФИК
import { supabase } from "@/lib/supabase";
import { useDashboard } from "@/hooks/useDashboard";
import { HEARTS, MESSAGES, MILESTONES } from "@/lib/constants";
import { randomOf } from "@/lib/utils";

// Функция для звука
const playSound = (type: 'up' | 'down') => {
  const audio = new Audio(`https://actions.google.com/sounds/v1/cartoon/${type === 'up' ? 'pop' : 'clang_and_wobble'}.ogg`);
  audio.volume = 0.3;
  audio.play().catch(() => {});
};

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
  const [isExporting, setIsExporting] = useState(false);
  
  const currentUserId = session?.user?.id;
  const myProfile = profiles.find(p => p.id === currentUserId);
  const actorName = myProfile ? myProfile.display_name : "Гость";

  // Ref для картинки (оборачиваем весь контент, который нужно скачать)
  const captureRef = useRef<HTMLDivElement>(null);

  const handleIncrement = async (counterId: string, delta: number, e?: React.MouseEvent) => {
    if (!currentUserId) return;
    
    // ВИБРАЦИЯ И ТРЯСКА
    if (navigator.vibrate) navigator.vibrate(delta > 0 ? 40 : 80);
    playSound(delta > 0 ? 'up' : 'down');
    if (e?.currentTarget) {
      const card = (e.currentTarget as HTMLElement).closest('.group');
      if (card) {
        card.classList.add('animate-shake');
        setTimeout(() => card.classList.remove('animate-shake'), 200);
      }
    }

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

  // ФУНКЦИЯ ЭКСПОРТА В КАРТИНКУ
  const handleShare = async () => {
    if (!captureRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(captureRef.current, { 
        backgroundColor: '#0a0510',
        style: { transform: 'scale(1)' },
        pixelRatio: 2 // Чтобы картинка была четкой
      });
      
      const link = document.createElement("a");
      link.download = `spk-stats-${new Date().toISOString().slice(0,10)}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Картинка сохранена! 📸");
    } catch (err) {
      toast.error("Не удалось создать картинку");
    } finally {
      setIsExporting(false);
    }
  };

  const weekTotal = events.reduce((s, e) => s + (e.note === 'reset' ? 0 : e.delta), 0);

  return (
    <>
      <Background />
      
      {/* Оборачиваем всё в ref для экспорта */}
      <div ref={captureRef} className="relative min-h-screen overflow-x-hidden pb-24 bg-[#0a0510]">
        <main>
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

          {/* ГРАФИК */}
          <StatsChart counters={counters} profiles={profiles} />

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
        </main>
      </div>

      <div className="relative z-10 mt-12 flex flex-col sm:flex-row justify-center px-4 gap-4 pb-24">
        {currentUserId ? (
          <>
            <button onClick={handleShare} disabled={isExporting} className="w-full sm:w-auto rounded-full bg-gradient-to-r from-neon to-blood px-6 py-3 sm:py-2.5 text-sm font-display uppercase tracking-widest text-white shadow-[0_0_20px_rgba(255,45,149,.4)] backdrop-blur transition-all hover:scale-105 disabled:opacity-50">
              {isExporting ? "Генерируем..." : "📸 Поделиться"}
            </button>
            <button onClick={handleReset} className="w-full sm:w-auto rounded-full border border-neon/40 bg-black/50 px-6 py-3 sm:py-2.5 text-sm font-display uppercase tracking-widest text-neon-rose backdrop-blur transition-all hover:border-neon hover:bg-black/70">
              🌙 Сброс
            </button>
            <button onClick={() => supabase.auth.signOut()} className="w-full sm:w-auto rounded-full border border-white/20 bg-black/50 px-6 py-3 sm:py-2.5 text-sm font-display uppercase tracking-widest text-bone/50 backdrop-blur transition-all hover:bg-white/10">
              Выйти
            </button>
          </>
        ) : (
          <button onClick={onLoginClick} className="w-full sm:w-auto rounded-full border border-neon/40 bg-black/50 px-8 py-3 sm:py-2.5 text-sm font-display uppercase tracking-widest text-neon-rose backdrop-blur transition-all hover:border-neon hover:bg-black/70">
            🔑 Войти или Зарегистрироваться
          </button>
        )}
      </div>

      {/* Чат */}
      {currentUserId && (
        <FloatingChat profiles={profiles} currentUserId={currentUserId} canChat={true} />
      )}
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