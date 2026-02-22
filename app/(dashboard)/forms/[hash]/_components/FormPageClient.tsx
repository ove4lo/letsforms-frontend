"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteForm } from "@/lib/form";
import { FormElements } from "@/components/builder/elements/FormElements";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Link2, MessageSquare, Trash2, Eye } from "lucide-react";
import { LoadingCat } from "@/components/LoadingCat";
import { PublishDialog } from "@/components/PublishDialog";
import useLoadForm from "@/hooks/useLoadForm";
import useFormStatusActions from "@/hooks/useFormStatusActions";
import { AdminServerForm, FormStatus, ServerQuestion } from "@/types/form";
import FormHeader from "./FormHeader"; // Импортируем новый компонент
import FormStats from "./FormStats"; // Импортируем новый компонент

interface FormPageClientProps {
  hash: string;
}

export default function FormPageClient({ hash }: FormPageClientProps) {
  const router = useRouter();

  // Используем хук для загрузки формы
  const { formData, loading: loadingForm, error: loadError, refetch } = useLoadForm(hash);

  // Используем хук для действий со статусом
  const { isUpdating: isStatusUpdating, error: statusError, updateStatus } = useFormStatusActions();

  const [publishOpen, setPublishOpen] = useState(false);

  // Обработчик удаления формы
  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить форму? Это действие нельзя отменить.")) return;

    try {
      await deleteForm(hash);
      router.push("/"); // или на дашборд
    } catch (error: any) {
      alert(`Ошибка удаления формы: ${error.message || "Неизвестная ошибка"}`);
    }
  };

  // Обработчик публикации (открывает диалог, если активна)
  const handlePublish = () => {
    if (formData?.status === "active") {
      setPublishOpen(true);
    } else {
      // Если не активна, сначала изменяем статус
      handleStatusChange("active");
    }
  };

  // Обработчик изменения статуса
  const handleStatusChange = async (newStatus: FormStatus) => {
    if (!formData || newStatus === formData.status) return;
    if (isStatusUpdating) return; // Защита от двойного клика

    try {
      await updateStatus(hash, newStatus);
      refetch();
      // Если статус стал active, открываем диалог публикации
      if (newStatus === "active") {
        setPublishOpen(true);
      }
    } catch (error: any) {
      console.error("Ошибка обновления статуса:", error);
    }
  };

  // Обработчик "Пройти форму"
  const handleTakeForm = () => {
    // Открываем форму в новой вкладке
    window.open(`/f/${hash}`, '_blank');
  };

  const parseOptions = (options: any): string[] | undefined => {
    if (!options) return undefined;

    if (typeof options === "string") {
      try {
        const parsed = JSON.parse(options);
        return Array.isArray(parsed) ? parsed : undefined;
      } catch {
        if (options.includes(",")) {
          return options
            .split(",")
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0);
        }
        return undefined;
      }
    }

    if (Array.isArray(options)) return options;

    return undefined;
  };

  // Функция для извлечения специфичных атрибутов по типу
  const getExtraAttributes = (question: any) => {
    const baseAttributes = {
      label: question.text || "Без названия",
      required: question.is_required || false,
      placeholder: question.placeholder || undefined,
    };

    // Для типов с options
    if (question.options && ["single_choice", "multiple_choice", "select"].includes(question.type)) {
      return {
        ...baseAttributes,
        options: parseOptions(question.options),
      };
    }

    // Для scale - парсим диапазон
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
        // Если парсинг не удался, используем дефолтные значения
        return {
          ...baseAttributes,
          min: 1,
          max: 10,
        };
      }
    }

    // Для number - проверяем есть ли options для min/max
    if (question.type === "number" && question.options) {
      try {
        const options = parseOptions(question.options);
        if (options && options.length === 2) {
          return {
            ...baseAttributes,
            min: parseInt(options[0]) || undefined,
            max: parseInt(options[1]) || undefined,
          };
        }
      } catch {
        // Оставляем min/max как есть или устанавливаем в undefined
      }
    }

    return baseAttributes;
  };

  // Маппинг типов бэкенда
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

  // Если загрузка, показываем спиннер
  if (loadingForm) {
    return (
      <div className="min-h-screen w-full bg-background">
        <LoadingCat message="Загрузка формы..." subMessage="Пожалуйста, подождите" />
      </div>
    );
  }

  // Если форма не найдена (formData === null), показываем сообщение
  if (!formData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Форма не найдена</p>
      </div>
    );
  }

  // Используем типизированные данные из formData
  const visits = formData.visit_count || 0;
  const submissions = formData.response_count || 0;
  const conversion = formData.conversion_rate || 0;
  const questions = formData.questions || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 p-6 lg:p-12 h-full">
        {/* Левая колонка */}
        <FormHeader
          formData={formData}
          onStatusChange={handleStatusChange}
          isUpdating={isStatusUpdating}
          onEdit={() => router.push(`/builder/${hash}`)}
          onViewResponses={() => router.push(`/forms/${hash}/responses`)}
          onDelete={handleDelete}
          onPublish={handlePublish}
          onTakeForm={handleTakeForm}
          publishOpen={publishOpen}
          setPublishOpen={setPublishOpen}
        />

        {/* Правая колонка — предпросмотр формы */}
        <div className="h-full">
          <Card className="h-full rounded-3xl shadow-2xl overflow-hidden">
            <CardContent className="p-0 h-full">
              <div className="bg-card h-full flex flex-col">
                <div className="p-8 text-center border-b">
                  <h2 className="text-3xl font-semibold">
                    Предпросмотр формы
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-8">
                  {questions.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-xl text-muted-foreground text-center">
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
                            <div key={question.id} className="space-y-2">
                              <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                {question.text || "Информационный блок"}
                              </div>
                              {question.placeholder && (
                                <p className="text-muted-foreground text-sm">
                                  {question.placeholder}
                                </p>
                              )}
                            </div>
                          );
                        }

                        const FormComponent = FormElements[clientType]?.formComponent;

                        if (!FormComponent) {
                          return (
                            <div key={question.id} className="p-4 border rounded bg-gray-100 dark:bg-gray-800">
                              <p className="font-medium">{question.text}</p>
                              <p className="text-sm text-muted-foreground">
                                Тип поля не поддерживается: {question.type}
                              </p>
                            </div>
                          );
                        }

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
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <PublishDialog open={publishOpen} onOpenChange={setPublishOpen} hash={hash} />
      </div>
    </div>
  );
}