"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Набор эмодзи, идеально подходящих под наши реалии
const EMOJI_LIST = [
  "🔥", "💅", "😱", "🚜", "📄", "👮‍♀️", 
  "🛸", "💸", "🚧", "💀", "🍷", "☕", 
  "🤬", "🛠️", "📉", "💣", "🦺", "🧱", 
  "🥀", "🩸", "🧸", "🎀", "💖", "👑"
];

export function AddCounterModal({ isOpen, onClose, userId }: { isOpen: boolean; onClose: () => void; userId: string }) {
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("🔥");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!title.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("counters").insert({ user_id: userId, title: title.trim(), emoji });
    setLoading(false);
    
    if (error) { toast.error("Ошибка при создании"); return; }
    toast.success("Счётчик добавлен!");
    
    setTitle(""); 
    setEmoji("🔥"); 
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md rounded-3xl border border-neon/30 bg-surface p-6 shadow-[0_0_40px_rgba(255,45,149,.4)] relative">
            
            <button onClick={onClose} className="absolute right-4 top-4 text-bone/40 hover:text-bone transition-colors">✕</button>
            
            <h3 className="text-center font-display text-xl uppercase text-bone mb-5">Новая проблема</h3>
            
            {/* Поле ввода названия */}
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Что случилось? (например, 'Сгорел пуховик')" 
              className="w-full rounded-xl border-2 border-white/10 bg-black/50 px-4 py-3 text-sm text-bone outline-none focus:border-neon/60 focus:shadow-[0_0_20px_rgba(255,45,149,.4)] mb-4" 
            />

            {/* Выбор эмодзи */}
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-bone/50 mb-3 text-center">
                Выбери иконку
              </p>
              
              {/* Выбранный эмодзи крупно */}
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-neon bg-neon/10 text-4xl shadow-[0_0_20px_rgba(255,45,149,.4)]">
                  {emoji}
                </div>
              </div>

              {/* Сетка эмодзи */}
              <div className="grid grid-cols-6 gap-2 max-h-[160px] overflow-y-auto pr-1">
                {EMOJI_LIST.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all ${
                      emoji === e 
                        ? "bg-neon/20 border-2 border-neon scale-110" 
                        : "bg-black/40 border-2 border-transparent hover:bg-white/10"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleAdd} 
              disabled={loading || !title.trim()} 
              className="w-full rounded-xl bg-gradient-to-r from-neon to-blood py-3 text-sm font-bold uppercase text-white shadow-lg hover:shadow-[0_0_30px_rgba(255,45,149,.6)] transition-all disabled:opacity-50"
            >
              {loading ? "Сохраняем..." : "Добавить"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}