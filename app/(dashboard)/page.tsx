import { Suspense } from "react";
import { CardStatsWrapper } from "@/components/dashboards/CardStatsWrapper";
import { StatsCardsLoading } from "@/components/dashboards/StatsCardsLoading";
import { Separator } from "@radix-ui/react-separator";
import { CreateFormBtn } from "@/components/CreateFormBtn";

export default function DashboardPage() {
  return (
    <div className="p-6 pt-8 max-w-7xl mx-auto">
      <Suspense fallback={<StatsCardsLoading />}>
        <CardStatsWrapper />
      </Suspense>

      <Separator className="my-6" />
      <h2 className="text-4xl font-bold col-span-2">Формы</h2>
      <Separator className="my-6" />
      <CreateFormBtn />
    </div>
  );
}