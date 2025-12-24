"use client";

import { useEffect, useState } from "react";
import { StatsCards } from "./StatsCards";
import { getFormStats } from "@/lib/stats";
import { StatsCardsLoading } from "./StatsCardsLoading";

export function CardStatsWrapper() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const data = await getFormStats();
      setStats(data);
      setLoading(false);
    }

    loadStats();
  }, []);

  if (loading) {
    return <StatsCardsLoading />;
  }

  return <StatsCards data={stats} loading={false} />;
}