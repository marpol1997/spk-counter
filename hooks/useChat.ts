"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Message } from "@/lib/types";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Загружаем последние 50 сообщений
    supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(50)
      .then(({ data }) => {
        if (data) setMessages(data as Message[]);
        setLoading(false);
      });

    // Слушаем новые, измененные и удаленные сообщения
    const channel = supabase
      .channel("chat-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        (payload) => {
          const updated = payload.new as Message;
          setMessages((prev) => prev.map(m => m.id === updated.id ? updated : m));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => prev.filter(m => m.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sendMessage = async (text: string, userId: string) => {
    const { error } = await supabase
      .from("messages")
      .insert({ text: text.trim(), user_id: userId });
    if (error) throw error;
  };

  const editMessage = async (id: number, text: string) => {
    const { error } = await supabase
      .from("messages")
      .update({ text: text.trim() })
      .eq("id", id);
    if (error) throw error;
  };

  const deleteMessage = async (id: number) => {
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", id);
    if (error) throw error;
  };

  return { messages, loading, sendMessage, editMessage, deleteMessage };
}