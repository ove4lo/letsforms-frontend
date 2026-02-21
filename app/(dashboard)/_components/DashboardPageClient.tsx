"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { CardStatsWrapper } from "@/components/dashboards/CardStatsWrapper";
import { StatsCardsLoading } from "@/components/dashboards/StatsCardsLoading";
import { CreateFormBtn } from "@/components/CreateFormBtn";
import { FormCards } from "@/components/dashboards/FormCards";
import { getMyForms } from "@/lib/form";
import { FormCardSkeleton } from "@/components/dashboards/FormCardSkeleton";
import { ErrorDialog } from "@/components/ErrorDialog";

interface DashboardPageClientProps {
  initialForms: any[];
  initialStats: any | null;
}

export default function DashboardPageClient({
  initialForms = [],
  initialStats = null,
}: DashboardPageClientProps) {
  const [forms, setForms] = useState<any[]>(initialForms);
  const [stats, setStats] = useState<any>(initialStats);
  const [loading, setLoading] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Ключевой флаг, который сохраняется между монтированиями
  const hasFetched = useRef(false);
  const isMounted = useRef(true);

  const refreshForms = async () => {
    // Защита от дублей
    if (hasFetched.current) {
      console.log("[refreshForms] Уже выполнен → пропускаем (Strict Mode или повторный mount)");
      return;
    }

    hasFetched.current = true;
    setLoading(true);

    try {
      console.log("[refreshForms] Начинаем загрузку данных...");
      const data = await getMyForms();
      
      const mapped = (data.results || []).map((form: any) => ({
        hash: form.hash,
        title: form.title,
        description: form.description,
        created_at: form.created_at,
        status: form.status,
        visit_count: form.visit_count || 0,
        response_count: form.response_count || 0,
        conversion_rate: form.conversion_rate || 0,
      }));
      
      setForms(mapped);
      setStats(data.user_statistics || null);
    } catch (error: any) {
      console.error("Ошибка обновления форм:", error);
      if (error.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("tg_user");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
        setErrorMessage("Сессия истекла. Пожалуйста, войдите снова.");
        setErrorOpen(true);
        return;
      }
      setErrorMessage("Не удалось обновить формы. Попробуйте позже.");
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Сохраняем, что компонент смонтирован
    isMounted.current = true;

    // Запускаем загрузку только один раз
    if (initialForms.length === 0 || !initialStats) {
      refreshForms();
    }

    return () => {
      isMounted.current = false;
      // Можно добавить отмену запросов, если нужно
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Добро пожаловать!</h1>

      <Suspense fallback={<StatsCardsLoading />}>
        <CardStatsWrapper
          initialStats={stats}
          loading={loading}
        />
      </Suspense>

      <div className="mt-12" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <CreateFormBtn onFormCreated={() => {
          hasFetched.current = false; // сбрасываем флаг при создании новой формы
          refreshForms();
        }} />

        {loading ? (
          <>
            <FormCardSkeleton />
            <FormCardSkeleton />
            <FormCardSkeleton />
          </>
        ) : forms.length === 0 ? (
          <div className="col-span-full flex items-center justify-center py-20 text-center">
            <div>
              <p className="text-3xl font-semibold text-muted-foreground mb-4">
                У вас пока нет форм
              </p>
              <p className="text-lg text-muted-foreground">
                Нажмите кнопку «Создать форму», чтобы начать
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