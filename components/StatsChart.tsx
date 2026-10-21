"use client";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { Counter, Profile } from "@/lib/types";

export function StatsChart({ counters, profiles }: { counters: Counter[], profiles: Profile[] }) {
  // Считаем общее количество по каждому названию счётчика
  const dataMap: Record<string, number> = {};
  counters.forEach(c => {
    dataMap[c.title] = (dataMap[c.title] || 0) + c.value;
  });

  // Берем топ-5 самых больших проблем
  const data = Object.entries(dataMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (data.length === 0) return null;

  return (
    <div className="mx-auto mt-10 max-w-3xl px-4 sm:px-6">
      <div className="rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
        <h3 className="text-center font-display text-sm font-bold uppercase tracking-widest text-amber/80 mb-6">
          📊 График страданий (Топ-5)
        </h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#f5e9d7', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,45,149,0.1)' }}
                contentStyle={{ backgroundColor: '#150a1f', borderColor: '#ff2d95', borderRadius: '10px', color: '#f5e9d7' }} 
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#ff2d95' : '#a855f7'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}