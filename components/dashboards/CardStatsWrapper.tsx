"use client";

import { useEffect } from "react";
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
  
  console.log("📊 ===== CardStatsWrapper =====");
  console.log("📊 loading:", loading);
  console.log("📊 initialStats (с сервера):", initialStats);
  
  useEffect(() => {
    if (!loading && initialStats) {
      console.log("📊 ДЕТАЛЬНЫЙ АНАЛИЗ ПОЛУЧЕННОЙ СТАТИСТИКИ:");
      console.log("  - total_visits:", initialStats.total_visits);
      console.log("  - total_responses:", initialStats.total_responses);
      console.log("  - overall_conversion_rate:", initialStats.overall_conversion_rate);
      console.log("  - overall_bounce_rate:", initialStats.overall_bounce_rate);
      
      // Проверяем, есть ли посещения
      if (initialStats.total_visits === 0 && initialStats.total_responses > 0) {
        console.log("📊 ⚠️ ВНИМАНИЕ: есть ответы, но нет посещений!");
        console.log("📊 ⚠️ Это может означать, что счетчик посещений не работает");
        console.log("📊 ⚠️ Статистика была пересчитана вручную на основе форм");
      }
      
      // Проверяем конверсию
      if (initialStats.total_visits > 0) {
        const expectedConversion = (initialStats.total_responses / initialStats.total_visits) * 100;
        console.log("📊 ПРОВЕРКА КОНВЕРСИИ:", {
          получено: initialStats.overall_conversion_rate,
          ожидалось: expectedConversion.toFixed(2),
          разница: Math.abs(initialStats.overall_conversion_rate - expectedConversion)
        });
      }
    }
    
    console.log("📊 ===== КОНЕЦ CardStatsWrapper =====\n");
  }, [initialStats, loading]);

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

  console.log("📊 Финальные данные для StatsCards:", stats);

  return <StatsCards data={stats} loading={false} />;
}