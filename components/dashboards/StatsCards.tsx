"use client";

import { StatsCard } from "./StatsCard";
import { LuView, LuMousePointerClick, LuTrendingUp, LuTrendingDown } from "react-icons/lu";

interface Props {
  data: {
    visits?: number;
    submissions?: number;
    submissionRate?: number;
    bounceRate?: number;
  } | null;
  loading: boolean;
}

export function StatsCards({ data, loading }: Props) {
  const visits = data?.visits ?? 0;
  const submissions = data?.submissions ?? 0;
  const submissionRate = data?.submissionRate ?? 0;
  const bounceRate = data?.bounceRate ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
      
      <StatsCard
        title="Посещений"
        icon={<LuView className="h-6 w-6 sm:h-7 sm:w-7" />}
        helperText="За всё время"
        value={loading ? "—" : visits.toLocaleString("ru-RU")}
        loading={loading}
        className="border-2 border-blue-500/40 bg-blue-500/5 shadow-xl shadow-blue-500/20"
      />
      
      <StatsCard
        title="Ответов"
        icon={<LuMousePointerClick className="h-6 w-6 sm:h-7 sm:w-7" />}
        helperText="За всё время"
        value={loading ? "—" : submissions.toLocaleString("ru-RU")}
        loading={loading}
        className="border-2 border-orange-500/40 bg-orange-500/5 shadow-xl shadow-orange-500/20"
      />
      
      <StatsCard
        title="Конверсия"
        icon={<LuTrendingUp className="h-6 w-6 sm:h-7 sm:w-7" />}
        helperText="Процент заполнивших"
        value={loading ? "—" : `${submissionRate.toFixed(1)}%`}
        loading={loading}
        className="border-2 border-emerald-500/40 bg-emerald-500/5 shadow-xl shadow-emerald-500/20"
      />
      
      <StatsCard
        title="Отказы"
        icon={<LuTrendingDown className="h-6 w-6 sm:h-7 sm:w-7" />}
        helperText="Ушли без действий"
        value={loading ? "—" : `${bounceRate.toFixed(1)}%`}
        loading={loading}
        className="border-2 border-red-500/40 bg-red-500/5 shadow-xl shadow-red-500/20"
      />
    </div>
  );
}