"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getFormByHash, updateFormStatus } from "@/lib/form";
import { FormElements } from "@/components/builder/elements/FormElements";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Link2, Trash2 } from "lucide-react";
import { LoadingCat } from "@/components/LoadingCat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronsUpDown } from "lucide-react";

// Конфиг статусов
const statusConfig = {
  draft: { label: "Черновик", variant: "secondary" as const },
  active: { label: "Активна", variant: "default" as const },
  paused: { label: "Приостановлена", variant: "secondary" as const },
  archived: { label: "Архивирована", variant: "outline" as const },
};

export default function FormPage() {
  const params = useParams();
  const router = useRouter();
  const hash = params.hash as string;

  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    getFormByHash(hash).then((data) => {
      setFormData(data);
      setLoading(false);
    });
  }, [hash]);

  if (loading) {
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

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === formData.status) return;
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      await updateFormStatus(hash, newStatus);
      // Обновляем локальное состояние
      setFormData((prev: any) => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error("Ошибка обновления статуса:", error);
      alert("Не удалось обновить статус. Попробуйте позже.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Получаем текущий статус
  const currentStatus = formData.status || "draft";
  const currentStatusInfo = statusConfig[currentStatus as keyof typeof statusConfig] || statusConfig.draft;


  // Данные из бэкенда
  const visits = formData.visit_count || 0;
  const submissions = formData.response_count || 0;
  const conversion = formData.conversion_rate || 0;

  // Вопросы из бэкенда
  const questions = formData.questions || [];

  // Безопасный парсинг options
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

  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 p-6 lg:p-12 h-full">
        {/* Левая колонка */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              {/* Выпадающий список статуса */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Badge
                    variant={currentStatusInfo.variant}
                    className="text-base px-3 py-1 cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-1"
                  >
                    {currentStatusInfo.label}
                    <ChevronsUpDown className="h-3 w-3" />
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <DropdownMenuItem
                      key={key}
                      onSelect={() => handleStatusChange(key)}
                      disabled={isUpdating || key === currentStatus}
                      className="flex items-center gap-2"
                    >
                      {key === currentStatus && <Check className="h-4 w-4" />}
                      {config.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              {formData.title}
            </h1>
            {formData.description ? (
              <p className="text-xl text-muted-foreground leading-relaxed">
                {formData.description}
              </p>
            ) : (
              <p className="text-xl text-muted-foreground italic">
                Описание не указано
              </p>
            )}
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-5 text-center bg-card/50 dark:bg-card/30 ring-1 ring-primary/20 hover:ring-primary/50 transition-all">
              <p className="text-3xl font-bold text-primary">
                {visits.toLocaleString("ru-RU")}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Посещений</p>
            </Card>
            <Card className="p-5 text-center bg-card/50 dark:bg-card/30 ring-1 ring-primary/20 hover:ring-primary/50 transition-all">
              <p className="text-3xl font-bold text-primary">
                {submissions.toLocaleString("ru-RU")}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Ответов</p>
            </Card>
            <Card className="p-5 text-center bg-card/50 dark:bg-card/30 ring-1 ring-primary/20 hover:ring-primary/50 transition-all">
              <p className="text-3xl font-bold text-primary">
                {conversion}%
              </p>
              <p className="text-sm text-muted-foreground mt-2">Конверсия</p>
            </Card>
          </div>

          {/* Кнопки */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="min-w-[160px] justify-center"
              onClick={() => {
                const link = `${window.location.origin}/f/${hash}`;
                navigator.clipboard.writeText(link);
                alert("Ссылка скопирована!");
              }}
            >
              <Link2 className="mr-2 h-5 w-5" />
              Опубликовать
            </Button>

            <Button
              className="min-w-[160px] justify-center"
              onClick={() => router.push(`/builder/${hash}`)}
            >
              <Edit className="mr-2 h-5 w-5" />
              Редактировать
            </Button>

            <Button
              variant="destructive"
              className="min-w-[160px] justify-center"
            >
              <Trash2 className="mr-2 h-5 w-5" />
              Удалить
            </Button>
          </div>
        </div>

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
      </div>
    </div>
  );
}