"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function AuthScreen({ onClose }: { onClose?: () => void }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState(""); // <-- НОВОЕ ПОЛЕ
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (isRegister) {
      if (!displayName.trim()) {
        setError("Пожалуйста, введите ваше имя");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { display_name: displayName.trim() } // Передаем имя в базу
        }
      });
      if (error) setError(error.message);
      else toast.success("Аккаунт создан! Добро пожаловать.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError("Неверный логин или пароль");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-neon/30 bg-surface p-7 shadow-[0_0_60px_-10px_rgba(255,45,149,.6)]">
        <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-neon to-transparent" />
        
        {onClose && (
          <button onClick={onClose} className="absolute right-4 top-4 text-bone/40 hover:text-bone text-lg">✕</button>
        )}

        <div className="text-center text-4xl">✝</div>
        <h2 className="mt-3 text-center font-display text-2xl uppercase tracking-widest text-bone">
          {isRegister ? "Регистрация" : "Вход"}
        </h2>
        
        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          {/* Поле имени появляется только при регистрации */}
          {isRegister && (
            <input
              type="text"
              placeholder="Имя и Отчество"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border-2 border-white/10 bg-black/50 px-4 py-3 text-center text-base text-bone placeholder-bone/30 outline-none focus:border-neon/60 focus:shadow-[0_0_20px_rgba(255,45,149,.4)]"
              required
            />
          )}

          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border-2 border-white/10 bg-black/50 px-4 py-3 text-center text-base text-bone placeholder-bone/30 outline-none focus:border-neon/60 focus:shadow-[0_0_20px_rgba(255,45,149,.4)]"
            required
          />
          <input
            type="password"
            placeholder="Пароль (мин. 6 символов)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border-2 border-white/10 bg-black/50 px-4 py-3 text-center text-base text-bone placeholder-bone/30 outline-none focus:border-neon/60 focus:shadow-[0_0_20px_rgba(255,45,149,.4)]"
            required
          />
          
          {error && <p className="text-center text-xs text-red-400">{error}</p>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-neon to-blood py-3 font-display uppercase tracking-widest text-white shadow-[0_0_30px_rgba(255,45,149,.5)] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {loading ? "Загрузка..." : isRegister ? "Создать аккаунт" : "Войти 💫"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button 
            type="button" 
            onClick={() => { setIsRegister(!isRegister); setError(""); }} 
            className="text-xs text-bone/50 hover:text-neon-rose underline transition-colors"
          >
            {isRegister ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
          </button>
        </div>
      </div>
    </div>
  );
}