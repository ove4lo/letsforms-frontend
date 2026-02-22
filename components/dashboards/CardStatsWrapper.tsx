"use client";

import { StatsCards } from "./StatsCards";
import { StatsCardsLoading } from "./StatsCardsLoading";
import { UserStatistics } from "@/types/form";

interface CardStatsWrapperProps {
  initialStats?: UserStatistics | null;
  loading?: boolean;
}

export function CardStatsWrapper({
  initialStats = null,
  loading = false,
}: CardStatsWrapperProps) {
  if (loading) {
    return <StatsCardsLoading />;
  }

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

  return <StatsCards data={stats} loading={false} />;
}