"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useChat } from "@/hooks/useChat";
import type { Profile } from "@/lib/types";
import { toast } from "sonner";

export function FloatingChat({ profiles, currentUserId, canChat }: { profiles: Profile[], currentUserId: string | null, canChat: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);
  
  const { messages, sendMessage, editMessage, deleteMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Запоминаем ID последнего прочитанного сообщения
  const lastSeenMessageId = useRef<number | null>(null);

  // Состояние для редактирования
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  // Логика непрочитанных и автоскролла
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];

    if (isOpen) {
      // Если чат открыт: скроллим вниз и обнуляем счетчик
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnread(0);
      lastSeenMessageId.current = lastMsg.id;
    } else {
      // Если чат закрыт:
      if (lastSeenMessageId.current === null) {
        // Первая загрузка, просто запоминаем
        lastSeenMessageId.current = lastMsg.id;
      } else if (lastMsg.id !== lastSeenMessageId.current) {
        // Пришло новое сообщение, проверяем, не от нас ли оно
        if (lastMsg.user_id !== currentUserId) {
          setUnread(prev => prev + 1);
        }
        lastSeenMessageId.current = lastMsg.id;
      }
    }
  }, [messages, isOpen, currentUserId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentUserId) return;
    
    const text = input;
    setInput("");
    try {
      await sendMessage(text, currentUserId);
    } catch {
      toast.error("Не удалось отправить сообщение");
    }
  };

  const handleSaveEdit = async (id: number) => {
    if (!editText.trim()) return;
    try {
      await editMessage(id, editText);
      setEditingId(null);
    } catch {
      toast.error("Не удалось сохранить изменения");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить сообщение?")) return;
    try {
      await deleteMessage(id);
    } catch {
      toast.error("Не удалось удалить сообщение");
    }
  };

  return (
    <>
      {/* Плавающая кнопка */}
      <button
        onClick={() => { setIsOpen(true); setUnread(0); }}
        className={`fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-neon to-blood text-2xl text-white shadow-[0_0_30px_rgba(255,45,149,.6)] transition-transform hover:scale-110 active:scale-95 ${isOpen ? "hidden" : "flex"}`}
      >
        💬
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-neon shadow-md animate-bounce">
            {unread}
          </span>
        )}
      </button>

      {/* Окно чата */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-0 right-0 z-50 flex h-[80vh] w-full flex-col overflow-hidden border border-neon/30 bg-[#0a0510]/95 shadow-[0_0_60px_rgba(255,45,149,.3)] backdrop-blur-2xl sm:bottom-6 sm:right-6 sm:h-[500px] sm:w-[380px] sm:rounded-3xl"
          >
            {/* Шапка чата */}
            <div className="flex items-center justify-between border-b border-white/10 bg-surface/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🕯️</span>
                <h3 className="font-display text-sm font-bold uppercase tracking-widest text-bone">Общий чат</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-bone/50 hover:bg-white/10 hover:text-bone">
                ✕
              </button>
            </div>

            {/* Список сообщений (с классом hide-scrollbar) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
              {messages.length === 0 && (
                <div className="text-center text-xs italic text-bone/40 mt-10">Тут пока тихо...</div>
              )}
              {messages.map((msg) => {
                const author = profiles.find(p => p.id === msg.user_id);
                const isMe = msg.user_id === currentUserId;
                const isEditing = editingId === msg.id;
                
                return (
                  <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    {/* Аватарка */}
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm ${isMe ? "bg-neon/20" : "bg-fuchsia-500/20"}`}>
                      {author?.avatar_url ? (
                        <img src={author.avatar_url} className="h-full w-full object-cover" />
                      ) : (
                        author?.emoji || "👤"
                      )}
                    </div>
                    
                    {/* Пузырь сообщения или режим редактирования */}
                    <div className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                      <span className="text-[9px] uppercase tracking-wider text-bone/40 mb-1 px-1">
                        {isMe ? "Вы" : author?.display_name || "Аноним"}
                      </span>
                      
                      {isEditing ? (
                        <div className="w-full min-w-[220px] rounded-2xl border border-neon/50 bg-black/50 p-2 shadow-lg">
                          <input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full bg-transparent text-sm text-bone outline-none mb-2 px-1"
                            autoFocus
                          />
                          <div className="flex justify-end gap-3 px-1">
                            <button onClick={() => setEditingId(null)} className="text-[10px] uppercase font-bold text-bone/50 hover:text-bone transition-colors">Отмена</button>
                            <button onClick={() => handleSaveEdit(msg.id)} className="text-[10px] uppercase font-bold text-neon hover:text-neon-rose transition-colors">Сохранить</button>
                          </div>
                        </div>
                      ) : (
                        <div className={`group flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                          <div className={`px-3 py-2 text-sm leading-relaxed break-words ${isMe ? "bg-gradient-to-br from-neon to-blood text-white rounded-2xl rounded-tr-sm" : "bg-white/10 text-bone rounded-2xl rounded-tl-sm"}`}>
                            {msg.text}
                          </div>
                          
                          {/* Кнопки управления (только для своих) */}
                          {isMe && (
                            <div className="flex gap-2 mt-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditingId(msg.id); setEditText(msg.text); }} className="text-[9px] uppercase font-bold text-bone/40 hover:text-neon transition-colors">✎ Ред.</button>
                              <button onClick={() => handleDelete(msg.id)} className="text-[9px] uppercase font-bold text-bone/40 hover:text-red-400 transition-colors">🗑 Удал.</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Поле ввода */}
            <div className="border-t border-white/10 bg-surface/50 p-3">
              {canChat ? (
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Написать сообщение..."
                    className="flex-1 rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm text-bone placeholder-bone/30 outline-none focus:border-neon/60"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neon text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    ➤
                  </button>
                </form>
              ) : (
                <p className="text-center text-xs text-bone/50 py-2">
                  Войдите в аккаунт, чтобы писать
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}