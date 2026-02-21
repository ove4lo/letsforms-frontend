"use client";

import { StatsCards } from "./StatsCards";
import { StatsCardsLoading } from "./StatsCardsLoading";

interface CardStatsWrapperProps {
  initialStats: any | null;
  loading?: boolean;
}

export function CardStatsWrapper({
  initialStats = null,
  loading = false,
}: CardStatsWrapperProps) {
  if (loading) {
    return <StatsCardsLoading />;
  }

  // Преобразуем данные в нужный формат
  const stats = initialStats
    ? {
        visits: initialStats.total_visits ?? 0,
        submissions: initialStats.total_responses ?? 0,
        submissionRate: Number((initialStats.overall_conversion_rate ?? 0).toFixed(1)),
        bounceRate: Number((initialStats.overall_bounce_rate ?? 0).toFixed(1)),
      }
    : {
        visits: 0,
        submissions: 0,
        submissionRate: 0,
        bounceRate: 0,
      };

  // Если статистика нулевая и это не загрузка — можно показать сообщение
  if (
    stats.visits === 0 &&
    stats.submissions === 0 &&
    stats.submissionRate === 0 &&
    stats.bounceRate === 0
  ) {
    return (
      <div className="p-6 text-center text-muted-foreground rounded-lg border bg-card">
        Пока нет статистики по формам
      </div>
    );
  }

  return <StatsCards data={stats} loading={false} />;
}