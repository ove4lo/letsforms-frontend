import { Suspense } from "react";
import { CardStatsWrapper } from "@/components/dashboards/CardStatsWrapper";
import { StatsCardsLoading } from "@/components/dashboards/StatsCardsLoading";
import { CreateFormBtn } from "@/components/CreateFormBtn";
import { FormCards } from "@/components/dashboards/FormCards";
import { getMyForms } from "@/lib/form";
import { FormCardSkeleton } from "@/components/dashboards/FormCardSkeleton";

export default async function DashboardPage() {
  const forms = await getMyForms(); 

  return (
    <div className="container mx-auto p-4 pt-8 max-w-7xl">
      <h1 className="text-4xl font-bold tracking-tight mb-10">
        Добро пожаловать!
      </h1>

      <Suspense fallback={<StatsCardsLoading />}>
        <CardStatsWrapper />
      </Suspense>

      <div className="mt-12" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <CreateFormBtn />
        <Suspense fallback={<FormCardSkeleton />}>
          <FormCards initialForms={forms} />
        </Suspense>
      </div>
    </div>
  );
}