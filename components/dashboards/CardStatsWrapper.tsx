import { StatsCards } from "./StatsCards";
import { getFormStats } from "@/lib/stats";

export async function CardStatsWrapper() {
  const stats = await getFormStats();

  return <StatsCards data={stats} loading={false} />;
}