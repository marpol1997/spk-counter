export type PersonId = "anna" | "valeria";
export type CounterId =
  | "breakdown" | "threats" | "excavator"
  | "claim" | "police" | "riot"| "drone";

export interface Person {
  id: PersonId;
  name: string;
  shortName: string;
  title: string;
  emoji: string;
  gradient: string;
}

export interface CounterMeta {
  id: CounterId;
  label: string;
  emoji: string;
}

export interface EventRow {
  id: number;
  person_id: PersonId | "all";
  counter_id: CounterId | "all";
  delta: number;
  actor: string | null;
  note: string | null;
  created_at: string;
}