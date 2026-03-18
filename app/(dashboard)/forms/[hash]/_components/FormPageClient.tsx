"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteForm } from "@/lib/form";
import { LoadingCat } from "@/components/ui/loading-cat";
import { PageError } from "@/components/ui/page-error";
import { PublishDialog } from "@/components/PublishDialog";
import useLoadForm from "@/hooks/useLoadForm";
import useFormStatusActions from "@/hooks/useFormStatusActions";
import { FormStatus } from "@/types/form";
import FormHeader from "./FormHeader";
import FormPreview from "./FormPreview";
import { FormStatsCompact } from "./FormStatsCompact";

interface FormPageClientProps {
  hash: string;
}

export default function FormPageClient({ hash }: FormPageClientProps) {
  const router = useRouter();

  const { formData, loading: loadingForm, error: loadError, refetch } = useLoadForm(hash);
  const { isUpdating: isStatusUpdating, updateStatus } = useFormStatusActions();

  const [localStatus, setLocalStatus] = useState<FormStatus | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);

  const currentStatus = localStatus ?? formData?.status ?? "draft";

  // Обработчики
  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить форму?")) return;
    try {
      await deleteForm(hash);
      router.push("/");
    } catch (error: any) {
      alert(`Ошибка: ${error.message}`);
    }
  };

  const handlePublish = () => {
    if (currentStatus === "active") setPublishOpen(true);
    else handleStatusChange("active");
  };

  const handleStatusChange = async (newStatus: FormStatus) => {
    if (!formData || newStatus === currentStatus || isStatusUpdating) return;
    try {
      await updateStatus(hash, newStatus);
      setLocalStatus(newStatus);
      if (newStatus === "active") setPublishOpen(true);
    } catch (error: any) {
      alert(`Ошибка статуса: ${error.message}`);
    }
  };

  const hasQuestions = (formData?.questions || []).some((q) => q.type !== "info");

  // 1. Загрузка
  if (loadingForm) {
    return (
      <div className="min-h-screen w-full bg-background">
        <LoadingCat message="Загрузка формы..." subMessage="Получаем данные" />
      </div>
    );
  }

  // 2. Ошибка
  if (loadError || !formData) {
    return (
      <PageError
        title="Не удалось загрузить форму"
        message={loadError || "Форма не найдена."}
        onRetry={refetch}
        type={!formData ? "not-found" : "error"}
      />
    );
  }

  // 3. Рендер
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-[1920px]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 lg:gap-12 items-start">

          {/* ЛЕВАЯ КОЛОНКА */}
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500 w-full flex flex-col">

            <div className="w-full">
              <FormHeader
                formData={{ ...formData, status: currentStatus }}
                onStatusChange={handleStatusChange}
                isUpdating={isStatusUpdating}
                onEdit={() => router.push(`/builder/${hash}`)}
                onViewResponses={() => router.push(`/forms/${hash}/responses`)}
                onDelete={handleDelete}
                onPublish={handlePublish}
                onTakeForm={() => window.open(`/f/${hash}`, "_blank")}
                hasQuestions={hasQuestions}
              />
            </div>

            <div className="w-full">
              {/* Используем обновленный FormStatsCompact с hash */}
              <FormStatsCompact 
                hash={hash}
                initialVisits={formData?.visit_count}
                initialSubmissions={formData?.response_count}
                initialSubmissionRate={formData?.conversion_rate}
                // bounceRate не передаем, так как его нет в formData
              />
            </div>

          </div>

          {/* ПРАВАЯ КОЛОНКА: Предпросмотр */}
          <div className="min-w-0 animate-in fade-in slide-in-from-right-4 duration-500 delay-100 w-full">
            <FormPreview formData={formData} />
          </div>
        </div>
      </div>

      <PublishDialog open={publishOpen} onOpenChange={setPublishOpen} hash={hash} />
    </div>
  );
}