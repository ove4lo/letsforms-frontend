"use client";

import { CardStatsWrapper } from "@/components/dashboards/CardStatsWrapper";
import { CreateFormBtn } from "@/components/CreateFormBtn";
import { FormCards } from "@/components/dashboards/FormCards";
import { FormCardSkeleton } from "@/components/dashboards/FormCardSkeleton";
import { ErrorDialog } from "@/components/ErrorDialog";
import useLoadMyForms from "@/hooks/useLoadMyForms";
import { FormSummary } from "@/types/form";

export default function DashboardPageClient() {
  const { data, loading: loadingForms, error, refetch } = useLoadMyForms();

  const showError = !!error;
  const errorMessage = error || "";

  const userStats = data?.user_statistics;

  const forms: FormSummary[] = (data?.results || []).map(f => ({
    ...f,
    description: f.description ?? null
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <CardStatsWrapper 
        initialStats={userStats} 
        loading={loadingForms} 
      />

      <div className="mt-12" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <CreateFormBtn onFormCreated={refetch} />

        {loadingForms ? (
          <>
            <FormCardSkeleton />
            <FormCardSkeleton />
            <FormCardSkeleton />
          </>
        ) : forms.length === 0 ? (
          <div className="col-span-full md:col-span-1 lg:col-span-2 xl:col-span-3 flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-3xl font-semibold text-muted-foreground mb-4">
                У вас пока нет форм
              </p>
              <p className="text-lg text-muted-foreground">
                Нажмите кнопку слева, чтобы создать первую форму
              </p>
            </div>
          </div>
        ) : (
          <FormCards initialForms={forms} />
        )}
      </div>

      <ErrorDialog
        open={showError}
        onOpenChange={() => {}}
        errorMessage={errorMessage}
        title="Ошибка загрузки"
      />
    </div>
  );
}