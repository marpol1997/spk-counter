"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function AuthScreen({ onClose }: { onClose?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) setError("Неверный логин или пароль");
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-neon/30 bg-surface p-7 shadow-[0_0_60px_-10px_rgba(255,45,149,.6)]">
        <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-transparent via-neon to-transparent" />
        
        {/* Кнопка закрытия */}
        {onClose && (
          <button 
            onClick={onClose} 
            className="absolute right-4 top-4 text-bone/40 hover:text-bone transition-colors text-lg"
          >
            ✕
          </button>
        )}

        <div className="text-center text-4xl">✝</div>
        <h2 className="mt-3 text-center font-display text-2xl uppercase tracking-widest text-bone">
          Вход
        </h2>
        <p className="mt-2 text-center text-[11px] italic leading-relaxed text-bone/50">
          Только для своих
        </p>
        
        <form onSubmit={handleLogin} className="mt-5 space-y-3">
          <input
            type="email"
            placeholder="anna@spk.local"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border-2 border-white/10 bg-black/50 px-4 py-3 text-center text-base text-bone placeholder-bone/30 outline-none transition-colors focus:border-neon/60 focus:shadow-[0_0_20px_rgba(255,45,149,.4)]"
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border-2 border-white/10 bg-black/50 px-4 py-3 text-center text-base text-bone placeholder-bone/30 outline-none transition-colors focus:border-neon/60 focus:shadow-[0_0_20px_rgba(255,45,149,.4)]"
            required
          />
          
          {error && <p className="text-center text-xs text-red-400">{error}</p>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-neon to-blood py-3 font-display uppercase tracking-widest text-white shadow-[0_0_30px_rgba(255,45,149,.5)] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {loading ? "Загрузка..." : "Войти 💫"}
          </button>
        </form>
      </div>
    </div>
  );
}