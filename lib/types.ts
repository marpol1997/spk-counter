export interface Profile {
  id: string;
  display_name: string;
  emoji: string;
  role_tag: string;
  avatar_url?: string | null; // <-- ДОБАВИЛИ
  created_at: string;
}
export interface Counter {
  id: string;
  user_id: string;
  title: string;
  emoji: string;
  value: number;
  created_at: string;
}

export interface EventRow {
  id: number;
  user_id: string;
  counter_id: string | null;
  delta: number;
  actor: string | null;
  note: string | null;
  created_at: string;
}

export interface Message {
  id: number;
  user_id: string;
  text: string;
  created_at: string;
}