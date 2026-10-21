"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { Profile } from "@/lib/types";

export function EditProfileModal({ isOpen, onClose, profile }: { isOpen: boolean; onClose: () => void; profile: Profile }) {
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [roleTag, setRoleTag] = useState(profile.role_tag);
  const [loading, setLoading] = useState(false);

  // Синхронизируем стейт, если профиль обновился (например, через Realtime)
  useEffect(() => {
    if (isOpen) {
      setDisplayName(profile.display_name);
      setRoleTag(profile.role_tag);
    }
  }, [isOpen, profile]);

  const handleSave = async () => {
    if (!displayName.trim()) return;
    setLoading(true);
    
    const { error } = await supabase
      .from("profiles")
      .update({ 
        display_name: displayName.trim(), 
        role_tag: roleTag.trim() || "Боец" 
      })
      .eq("id", profile.id);

    setLoading(false);
    if (error) { 
      toast.error("Ошибка при сохранении"); 
    } else { 
      toast.success("Профиль обновлен!"); 
      onClose(); 
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm rounded-3xl border border-neon/30 bg-surface p-6 shadow-[0_0_40px_rgba(255,45,149,.4)] relative">
            
            <button onClick={onClose} className="absolute right-4 top-4 text-bone/40 hover:text-bone transition-colors">✕</button>
            
            <h3 className="text-center font-display text-xl uppercase text-bone mb-5">Редактировать</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-bone/50 ml-1">Имя и Отчество</label>
                <input 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)} 
                  placeholder="Анна Васильевна" 
                  className="mt-1 w-full rounded-xl border-2 border-white/10 bg-black/50 px-4 py-3 text-sm text-bone outline-none focus:border-neon/60 focus:shadow-[0_0_20px_rgba(255,45,149,.4)]" 
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-bone/50 ml-1">Подпись (Роль)</label>
                <input 
                  value={roleTag} 
                  onChange={(e) => setRoleTag(e.target.value)} 
                  placeholder="Например: Гроза Теплогаза" 
                  className="mt-1 w-full rounded-xl border-2 border-white/10 bg-black/50 px-4 py-3 text-sm text-bone outline-none focus:border-neon/60 focus:shadow-[0_0_20px_rgba(255,45,149,.4)]" 
                />
              </div>
            </div>

            <button 
              onClick={handleSave} 
              disabled={loading || !displayName.trim()} 
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-neon to-blood py-3 text-sm font-bold uppercase text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {loading ? "Сохраняем..." : "Сохранить"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}