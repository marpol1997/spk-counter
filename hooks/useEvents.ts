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
      // 1. Последние события для ленты
      const { data } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (mounted && data) setEvents(data as EventRow[]);

      // 2. Ищем последний сброс — чтобы неделя начиналась после него
      const { data: lastReset } = await supabase
        .from("events")
        .select("created_at")
        .eq("note", "reset")
        .order("created_at", { ascending: false })
        .limit(1);

      const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
      const resetAt = lastReset?.[0]?.created_at;
      const since = resetAt && resetAt > weekAgo ? resetAt : weekAgo;

      // 3. Суммируем ВСЕ дельты (и +, и −) за период
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
          setEvents((prev) => [row, ...prev].slice(0, limit));
          if (row.note === "reset") {
            setWeekTotal(0);
          } else {
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