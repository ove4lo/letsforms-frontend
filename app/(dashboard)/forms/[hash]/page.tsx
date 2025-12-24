"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getFormByHash } from "@/lib/form";
import { FormElements } from "@/components/builder/elements/FormElements";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Link2, Trash2 } from "lucide-react";

export default function FormPage() {
  const params = useParams();
  const router = useRouter();
  const hash = params.hash as string;

  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFormByHash(hash).then((data) => {
      setFormData(data);
      setLoading(false);
    });
  }, [hash]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Загрузка формы...</p>
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
        return options
          .split(",")
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);
      }
    }

    if (Array.isArray(options)) return options;

    return undefined;
  };

  // Маппинг типов бэкенда 
  const typeMap: Record<string, keyof typeof FormElements> = {
    text: "TextField",
    text_area: "TextareaField",
    single_choice: "RadioField",
    multiple_choice: "CheckboxField",
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
              <Badge variant={formData.status === "active" ? "default" : "secondary"}>
                {formData.status === "active" ? "Активна" : "Черновик"}
              </Badge>
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
                    questions.map((element: any) => {
                      const clientType = typeMap[element.type] || "TextField";
                      const FormComponent = FormElements[clientType].formComponent;

                      const elementInstance = {
                        id: element.id.toString(),
                        type: clientType as keyof typeof FormElements,
                        extraAttributes: {
                          label: element.text || "Без названия",
                          required: element.is_required || false,
                          options: parseOptions(element.options),
                        },
                      };

                      return (
                        <div key={element.id}>
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