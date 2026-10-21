"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile, Counter, EventRow } from "@/lib/types";

export function useDashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Начальная загрузка
        const weekAgo = new Date(Date.now() - 7 * 86400_000).toISOString();

    Promise.all([
      supabase.from("profiles").select("*").order("created_at"),
      supabase.from("counters").select("*").order("created_at"),
      supabase.from("events").select("*").gte("created_at", weekAgo).order("created_at", { ascending: false })
    ]).then(([pRes, cRes, eRes]) => {
      if (pRes.data) setProfiles(pRes.data);
      if (cRes.data) setCounters(cRes.data);
      if (eRes.data) setEvents(eRes.data);
      setLoading(false);
    });

    // Realtime слушатель
    const channel = supabase.channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, payload => {
        if (payload.eventType === "UPDATE") {
          setProfiles(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } as Profile : p));
        }
        if (payload.eventType === "INSERT") {
          setProfiles(prev => [...prev, payload.new as Profile]);
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "counters" }, payload => {
        if (payload.eventType === "UPDATE") {
          setCounters(prev => prev.map(c => c.id === payload.new.id ? { ...c, ...payload.new } as Counter : c));
        }
        if (payload.eventType === "INSERT") {
          setCounters(prev => [...prev, payload.new as Counter]);
        }
        if (payload.eventType === "DELETE") {
          setCounters(prev => prev.filter(c => c.id !== payload.old.id));
        }
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "events" }, payload => {
        const row = payload.new as EventRow;
        if (row.note === "reset") setEvents([row]);
        else setEvents(prev => [row, ...prev].slice(0, 30));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const increment = async (counterId: string, delta: number, actor: string) => {
    const { data, error } = await supabase.rpc("increment_counter", { p_counter_id: counterId, p_delta: delta, p_actor: actor });
    if (error) throw error;
    return data as number;
  };

  const reset = async (actor: string) => {
    const { error } = await supabase.rpc("reset_all", { p_actor: actor });
    if (error) throw error;
  };

  return { profiles, counters, events, loading, increment, reset };
}