'use client';

export function LocalTime({ date }: { date: Date | string }) {
  const d = new Date(date);
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const day = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  return <>{time} · {day}</>;
}
