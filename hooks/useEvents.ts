"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { EventRow } from "@/lib/types";

export function useEvents(limit = 20) {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [weekTotal, setWeekTotal] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (mounted && data) setEvents(data as EventRow[]);

      // Ищем последний сброс
      const { data: lastReset } = await supabase
        .from("events")
        .select("created_at")
        .eq("note", "reset")
        .order("created_at", { ascending: false })
        .limit(1);

      const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
      const resetAt = lastReset?.[0]?.created_at;
      const since = resetAt && resetAt > weekAgo ? resetAt : weekAgo;

      const { data: week } = await supabase
        .from("events")
        .select("delta")
        .gte("created_at", since);
      if (mounted && week) {
        const sum = week.reduce((s, e) => s + e.delta, 0);
        setWeekTotal(Math.max(0, sum));
      }
    })();

    const channel = supabase
      .channel("events-stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "events" },
        (payload) => {
          const row = payload.new as EventRow;
          
          if (row.note === "reset") {
            // Если это сброс — очищаем ленту и оставляем только запись о сбросе
            setEvents([row]);
            setWeekTotal(0);
          } else {
            // Иначе просто добавляем в начало
            setEvents((prev) => [row, ...prev].slice(0, limit));
            setWeekTotal((t) => Math.max(0, (t ?? 0) + row.delta));
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [limit]);

  return { events, weekTotal };
}