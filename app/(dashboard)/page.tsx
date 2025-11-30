import { Suspense } from "react";
import { CardStatsWrapper } from "@/components/dashboard/CardStatsWrapper";
import { StatsCardsLoading } from "@/components/dashboard/StatsCardsLoading";

export default function DashboardPage() {
  return (
    <div className="p-6 pt-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight mb-10">
        Добро пожаловать!
      </h1>

      <Suspense fallback={<StatsCardsLoading />}>
        <CardStatsWrapper />
      </Suspense>
    </div>
  );
}