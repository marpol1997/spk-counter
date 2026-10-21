"use client";
import { motion } from "motion/react";
import type { Profile, Counter } from "@/lib/types";
import { CounterRow } from "./CounterRow";
import { useState, useRef } from "react";
import { AddCounterModal } from "./AddCounterModal";
import { EditProfileModal } from "./EditProfileModal"; // <-- ИМПОРТ
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Props {
  profile: Profile;
  counters: Counter[];
  canEdit: boolean;
  onIncrement: (counterId: string, delta: number, e?: React.MouseEvent) => void;
  index: number;
  sessionUserId: string | null;
}

export function PersonCard({ profile, counters, canEdit, onIncrement, index, sessionUserId }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // <-- НОВЫЙ СТЕЙТ
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const total = counters.reduce((s, c) => s + c.value, 0);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);

      if (updateError) throw updateError;
      toast.success("Аватарка обновлена! 📸");
    } catch (error: any) {
      toast.error("Ошибка загрузки: " + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAvatarDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Удалить аватарку?")) return;

    try {
      setUploading(true);
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: null }).eq('id', profile.id);
      if (updateError) throw updateError;

      if (profile.avatar_url) {
        const fileName = profile.avatar_url.split('/').pop();
        if (fileName) await supabase.storage.from('avatars').remove([fileName]);
      }
      toast.success("Аватарка удалена! 🪄");
    } catch (error: any) {
      toast.error("Ошибка при удалении: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: index * 0.15 }}
      className="group relative w-full"
    >
      <div className={`absolute inset-0 rounded-[2rem] opacity-40 blur-2xl transition-opacity duration-500 group-hover:opacity-70 ${canEdit ? "bg-gradient-to-br from-neon via-neon-rose to-blood" : "bg-gradient-to-br from-fuchsia-600 via-purple-700 to-neon"}`} />

      <div className="relative overflow-hidden rounded-[2rem] border border-neon/25 bg-surface/85 backdrop-blur-2xl">
        <div className={`h-[2px] w-full ${canEdit ? "bg-gradient-to-r from-transparent via-neon to-transparent" : "bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent"}`} />
        
        <span className="pointer-events-none absolute left-3 top-3 text-[10px] text-amber/50">✝</span>
        
        {/* Вместо правого крестика — кнопка редактирования (если canEdit) */}
        {canEdit ? (
          <button 
            onClick={() => setIsEditModalOpen(true)} 
            className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-amber/50 hover:bg-neon/20 hover:text-neon-rose transition-all"
            title="Редактировать профиль"
          >
            ✎
          </button>
        ) : (
          <span className="pointer-events-none absolute right-3 top-3 text-[10px] text-amber/50">✝</span>
        )}

        <div className="p-4 sm:p-7">
          <div className="mb-4 sm:mb-6 flex items-start gap-3 sm:gap-4">
            
            <div className="relative shrink-0">
              <div 
                onClick={() => canEdit && fileInputRef.current?.click()}
                className={`relative flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full text-2xl sm:text-3xl shadow-[0_0_40px_-5px] overflow-hidden transition-transform ${canEdit ? "cursor-pointer hover:scale-105" : ""} ${canEdit ? "bg-gradient-to-br from-neon to-blood shadow-neon/80" : "bg-gradient-to-br from-fuchsia-500 to-purple-700 shadow-fuchsia-500/80"}`}
              >
                <span className="absolute inset-0 rounded-full border border-white/20 animate-spin-slow pointer-events-none" />
                {uploading ? (
                  <span className="animate-pulse text-sm text-white">...</span>
                ) : profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.display_name} className="h-full w-full object-cover" />
                ) : (
                  profile.emoji
                )}

                {canEdit && !uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-xs">📸</span>
                  </div>
                )}
              </div>

              {canEdit && profile.avatar_url && !uploading && (
                <button
                  onClick={handleAvatarDelete}
                  className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md hover:bg-red-600 transition-colors"
                  title="Удалить аватарку"
                >
                  ✕
                </button>
              )}
            </div>
            
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />

            <div className="min-w-0 flex-1 pt-1">
              <div className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.35em] text-amber/70">{profile.role_tag}</div>
              <h2 className="mt-0.5 sm:mt-1 font-display text-base sm:text-xl font-bold uppercase leading-tight tracking-wide text-bone break-words line-clamp-2">
                {profile.display_name}
              </h2>
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            {counters.map((c) => (
              <CounterRow
                key={c.id} counter={c} accent={canEdit ? "pink" : "purple"} canEdit={canEdit}
                onIncrement={(e) => onIncrement(c.id, 1, e)} onDecrement={() => onIncrement(c.id, -1)}
              />
            ))}
            {counters.length === 0 && <p className="text-xs text-bone/40 italic">Тут пока пусто...</p>}
          </div>

          {canEdit && (
            <button onClick={() => setIsModalOpen(true)} className="mt-4 w-full rounded-xl border border-dashed border-neon/40 py-2 text-[10px] font-bold uppercase tracking-wider text-neon-rose transition-colors hover:bg-neon/10">
              + Добавить свой счётчик
            </button>
          )}

          <div className="mt-4 sm:mt-6 flex items-center justify-between rounded-2xl border border-amber/20 bg-gradient-to-r from-black/60 to-blood/20 px-3 py-2 sm:px-4 sm:py-3">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] text-amber/70">Итого пережито</span>
            <span className="font-serif text-2xl sm:text-3xl font-black tabular-nums text-bone drop-shadow-[0_0_14px_rgba(255,110,199,.8)]">{total}</span>
          </div>
        </div>
      </div>
      
      {canEdit && sessionUserId && (
        <>
          <AddCounterModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} userId={sessionUserId} />
          <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} profile={profile} />
        </>
      )}
    </motion.section>
  );
}