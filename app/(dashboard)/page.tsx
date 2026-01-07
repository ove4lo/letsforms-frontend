"use client";

import { useEffect, useState } from "react";
import { Suspense } from "react";
import { CardStatsWrapper } from "@/components/dashboards/CardStatsWrapper";
import { StatsCardsLoading } from "@/components/dashboards/StatsCardsLoading";
import { CreateFormBtn } from "@/components/CreateFormBtn";
import { FormCards } from "@/components/dashboards/FormCards";
import { getMyForms } from "@/lib/form";
import { FormCardSkeleton } from "@/components/dashboards/FormCardSkeleton";
import { ErrorDialog } from "@/components/ErrorDialog";

export default function DashboardPage() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadForms = async () => {
    setLoading(true);
    try {
      const data = await getMyForms();
      const mappedForms = (data.results || []).map((form: any) => ({
        hash: form.hash,
        title: form.title,
        description: form.description,
        created_at: form.created_at,
        status: form.status,
        visit_count: form.visit_count || 0,
        response_count: form.response_count || 0,
        conversion_rate: form.conversion_rate || 0,
      }));
      setForms(mappedForms);
    } catch (error: any) {
      console.error("Ошибка загрузки форм:", error);
      setErrorMessage("Не удалось загрузить ваши формы. Попробуйте позже или перезайдите.");
      setErrorOpen(true);
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, []);

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
        <CreateFormBtn onFormCreated={loadForms} />

        {loading ? (
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
        open={errorOpen}
        onOpenChange={setErrorOpen}
        errorMessage={errorMessage}
        title="Ошибка загрузки"
      />
    </div>
  );
}