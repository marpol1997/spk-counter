"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { COUNTERS, PEOPLE } from "@/lib/constants";
import type { CounterId, PersonId } from "@/lib/types";

export type CounterState = Record<PersonId, Record<CounterId, number>>;

function emptyState(): CounterState {
  const s = {} as CounterState;
  PEOPLE.forEach((p) => {
    s[p.id] = {} as Record<CounterId, number>;
    COUNTERS.forEach((c) => (s[p.id][c.id] = 0));
  });
  return s;
}

type Status = "connecting" | "live" | "error";

export function useCounters() {
  const [state, setState] = useState<CounterState>(emptyState);
  const [status, setStatus] = useState<Status>("connecting");

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data, error } = await supabase.from("counters").select("*");
      if (!mounted) return;
      if (error) { setStatus("error"); return; }
      setState((prev) => {
        const next: CounterState = { ...prev };
        data.forEach((row) => {
          const pid = row.person_id as PersonId;
          const cid = row.counter_id as CounterId;
          if (next[pid]) next[pid] = { ...next[pid], [cid]: row.value };
        });
        return next;
      });
    })();

    const channel = supabase
      .channel("counters-stream")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "counters" },
        (payload) => {
          const row = payload.new as { person_id: PersonId; counter_id: CounterId; value: number };
          if (!row?.person_id) return;
          setState((prev) => {
            if (!prev[row.person_id]) return prev;
            return {
              ...prev,
              [row.person_id]: { ...prev[row.person_id], [row.counter_id]: row.value },
            };
          });
        }
      )
      .subscribe((s) => {
        if (s === "SUBSCRIBED") setStatus("live");
        else if (s === "CHANNEL_ERROR" || s === "TIMED_OUT") setStatus("error");
      });

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const increment = async (
    pid: PersonId, cid: CounterId, delta: number, actor: string
  ): Promise<number> => {
    setState((prev) => ({
      ...prev,
      [pid]: { ...prev[pid], [cid]: Math.max(0, (prev[pid][cid] ?? 0) + delta) },
    }));

    const { data, error } = await supabase.rpc("increment_counter", {
      p_person_id: pid, p_counter_id: cid, p_delta: delta, p_actor: actor,
    });
    if (error) throw error;
    return data as number;
  };

  const reset = async (actor: string) => {
    const { error } = await supabase.rpc("reset_all", { p_actor: actor });
    if (error) throw error;
  };

  return { state, status, increment, reset };
}