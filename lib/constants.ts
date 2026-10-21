import type { CounterMeta, Person } from "./types";

export const PEOPLE: Person[] = [
  {
    id: "anna",
    name: "Анна Васильевна",
    shortName: "Анна",
    title: "Исполнительный директор · укротительница Теплогаза",
    emoji: "👑",
    gradient: "from-neon via-neon-rose to-blood",
  },
  {
    id: "valeria",
    name: "Валерия Сергеевна",
    shortName: "Валерия",
    title: "Главный по невозмутимости · гроза претензий",
    emoji: "💃",
    gradient: "from-fuchsia-500 via-purple-700 to-neon",
  },
];

export const COUNTERS: CounterMeta[] = [
  { id: "breakdown", label: "Нервный срыв",           emoji: "💅" },
  { id: "threats",   label: "Угроза от Теплогаза",    emoji: "😱" },
  { id: "excavator", label: "Украденный экскаватор",  emoji: "🚜" },
  { id: "claim",     label: "Претензия от Теплогаза", emoji: "📄" },
  { id: "police",    label: "Вызов в полицию",        emoji: "👮‍♀️" },
  { id: "riot",      label: "Бунт на площадке",       emoji: "🔥" },
];

export const MILESTONES = [10, 25, 50, 100, 200, 500] as const;

export const MESSAGES = [
  "Ой, ещё разок 😅","Держись, девочки! 💪","Теплогаз опять отличился 🙄",
  "Копим статистику! 📊","Это уже рекорд! 🏆","Мы с вами! ❤️",
  "Экскаваторы в бегах 🚜💨","СПК непобедим! ✨","Ай-ай-ай... 🤦‍♀️",
  "Ну всё, чай с пироженкой 🧁","Так держать! 🌸","Считаем дальше! 📈",
] as const;

export const HEARTS = ["🩷","✦","✧","🌸","✝","💖","🌙","⭐"] as const;