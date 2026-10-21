"use client";
import { useCallback, useEffect, useState } from "react";

const KEY = "spk-actor";

export function useActor() {
  const [actor, setActorState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActorState(localStorage.getItem(KEY));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoaded(true);
  }, []);

  const setActor = useCallback((v: string) => {
    localStorage.setItem(KEY, v);
    setActorState(v);
  }, []);

  return { actor, setActor, loaded };
}