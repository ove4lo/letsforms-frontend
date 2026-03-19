"use client";

import { CardStatsWrapper } from "@/components/dashboards/CardStatsWrapper";
import { CreateFormBtn } from "@/components/CreateFormBtn";
import { FormCards } from "@/components/dashboards/FormCards";
import { FormCardSkeleton } from "@/components/dashboards/FormCardSkeleton";
import useLoadMyForms from "@/hooks/useLoadMyForms";
import { FormSummary } from "@/types/form";

export default function DashboardPageClient() {
  const { data, loading: loadingForms, error, refetch } = useLoadMyForms();

  const userStats = data?.user_statistics;
  const forms: FormSummary[] = (data?.results || []).map(f => ({
    ...f,
    description: f.description ?? null
  }));

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
      
      {/* Статистика */}
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
            <FormCardSkeleton />
          </>
        ) : error ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-4">
            <p className="text-xl font-medium text-muted-foreground">
              Не удалось загрузить формы
            </p>
            <p className="text-sm text-muted-foreground max-w-md">
              {error.includes("Unauthorized") 
                ? "Сессия истекла. Перенаправляем на вход..." 
                : "Проверьте соединение и попробуйте снова."}
            </p>
            {!error.includes("Unauthorized") && (
              <button 
                onClick={refetch}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Обновить
              </button>
            )}
          </div>
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
    </div>
  );
}