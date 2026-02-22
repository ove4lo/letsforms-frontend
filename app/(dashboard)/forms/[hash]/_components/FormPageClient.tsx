"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteForm } from "@/lib/form";
import { FormElements } from "@/components/builder/elements/FormElements";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingCat } from "@/components/LoadingCat";
import { PublishDialog } from "@/components/PublishDialog";
import useLoadForm from "@/hooks/useLoadForm";
import useFormStatusActions from "@/hooks/useFormStatusActions";
import { AdminServerForm, FormStatus } from "@/types/form";
import FormHeader from "./FormHeader";

interface FormPageClientProps {
  hash: string;
}

export default function FormPageClient({ hash }: FormPageClientProps) {
  const router = useRouter();
  const { formData, loading: loadingForm, error: loadError, refetch } = useLoadForm(hash);
  const { isUpdating: isStatusUpdating, updateStatus } = useFormStatusActions();
  const [publishOpen, setPublishOpen] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить форму? Это действие нельзя отменить.")) return;
    try {
      await deleteForm(hash);
      router.push("/");
    } catch (error: any) {
      alert(`Ошибка удаления формы: ${error.message || "Неизвестная ошибка"}`);
    }
  };

  const handlePublish = () => {
    if (formData?.status === "active") {
      setPublishOpen(true);
    } else {
      handleStatusChange("active");
    }
  };

  const handleStatusChange = async (newStatus: FormStatus) => {
    if (!formData || newStatus === formData.status || isStatusUpdating) return;
    try {
      await updateStatus(hash, newStatus);
      refetch();
      if (newStatus === "active") {
        setPublishOpen(true);
      }
    } catch (error: any) {
      console.error("Ошибка обновления статуса:", error);
    }
  };

  const handleTakeForm = () => {
    window.open(`/f/${hash}`, '_blank');
  };

  // Флаг наличия вопросов (исключая информационные блоки)
  const hasQuestions = (formData?.questions || []).some(q => q.type !== "info");

  const parseOptions = (options: any): string[] | undefined => {
    if (!options) return undefined;
    if (typeof options === "string") {
      try {
        const parsed = JSON.parse(options);
        return Array.isArray(parsed) ? parsed : undefined;
      } catch {
        if (options.includes(",")) {
          return options.split(",").map((s: string) => s.trim()).filter(Boolean);
        }
        return undefined;
      }
    }
    return Array.isArray(options) ? options : undefined;
  };

  const getExtraAttributes = (question: any) => {
    const baseAttributes = {
      label: question.text || "Без названия",
      required: question.is_required || false,
      placeholder: question.placeholder || undefined,
    };

    if (question.options && ["single_choice", "multiple_choice", "select"].includes(question.type)) {
      return { ...baseAttributes, options: parseOptions(question.options) };
    }

    if (question.type === "scale" && question.options) {
      try {
        const options = parseOptions(question.options);
        if (options && options.length === 2) {
          return {
            ...baseAttributes,
            min: parseInt(options[0]) || 1,
            max: parseInt(options[1]) || 10,
          };
        }
      } catch {
        return { ...baseAttributes, min: 1, max: 10 };
      }
    }

    return baseAttributes;
  };

  const typeMap: Record<string, keyof typeof FormElements> = {
    text: "TextField",
    text_area: "TextareaField",
    single_choice: "RadioField",
    multiple_choice: "CheckboxField",
    select: "SelectField",
    number: "NumberField",
    scale: "ScaleField",
    date: "DateField",
    info: "ParagraphField",
  };

  if (loadError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-xl text-destructive">Ошибка: {loadError}</p>
      </div>
    );
  }

  if (loadingForm) {
    return (
      <div className="min-h-screen w-full bg-background">
        <LoadingCat message="Загрузка формы..." subMessage="Пожалуйста, подождите" />
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Форма не найдена</p>
      </div>
    );
  }

  const questions = formData.questions || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 p-6 lg:p-12">
        {/* Левая колонка */}
        <div className="space-y-8">
          <FormHeader
            formData={formData}
            onStatusChange={handleStatusChange}
            isUpdating={isStatusUpdating}
            onEdit={() => router.push(`/builder/${hash}`)}
            onViewResponses={() => router.push(`/forms/${hash}/responses`)}
            onDelete={handleDelete}
            onPublish={handlePublish}
            onTakeForm={handleTakeForm}
            hasQuestions={hasQuestions}
          />
        </div>

        {/* Правая колонка — предпросмотр формы */}
        <div>
          <Card className="rounded-3xl shadow-2xl overflow-hidden">
            <CardContent className="p-8 space-y-8">
              {/* Название и описание в предпросмотре */}
              <div className="space-y-4 pb-6 border-b">
                <h2 className="text-3xl font-bold">{formData.title || "Форма без названия"}</h2>
                {formData.description && (
                  <p className="text-lg text-muted-foreground">{formData.description}</p>
                )}
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-muted-foreground">
                    Форма пуста.<br />
                    Добавьте поля в редакторе.
                  </p>
                </div>
              ) : (
                questions
                  .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                  .map((question: any) => {
                    const clientType = typeMap[question.type] || "TextField";
                    
                    if (question.type === "info") {
                      return (
                        <div key={question.id} className="space-y-2 p-4 bg-muted/30 rounded-lg">
                          <p className="text-lg font-medium">{question.text || "Информационный блок"}</p>
                          {question.placeholder && (
                            <p className="text-muted-foreground">{question.placeholder}</p>
                          )}
                        </div>
                      );
                    }

                    const FormComponent = FormElements[clientType]?.formComponent;
                    if (!FormComponent) return null;

                    const elementInstance = {
                      id: question.id.toString(),
                      type: clientType as keyof typeof FormElements,
                      extraAttributes: getExtraAttributes(question),
                    };

                    return (
                      <div key={question.id} className="space-y-2">
                        <FormComponent elementInstance={elementInstance} />
                      </div>
                    );
                  })
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <PublishDialog open={publishOpen} onOpenChange={setPublishOpen} hash={hash} />
    </div>
  );
}