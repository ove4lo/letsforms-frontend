"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FormElements } from "@/components/builder/elements/FormElements";
import { AdminServerForm } from "@/types/form";

interface FormPreviewProps {
  formData: AdminServerForm;
}

export default function FormPreview({ formData }: FormPreviewProps) {
  const questions = formData.questions || [];

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

  const hasQuestions = questions.some((q) => q.type !== "info");

  return (
    <Card className="rounded-3xl shadow-2xl overflow-hidden border-border/50">
      <CardContent className="p-8 space-y-8 min-h-[470px]">
        {/* Заголовок предпросмотра */}
        <div className="space-y-4 pb-6 border-b border-border">
          <h2 className="text-3xl font-bold tracking-tight">{formData.title || "Форма без названия"}</h2>
          {formData.description && (
            <p className="text-lg text-muted-foreground leading-relaxed">{formData.description}</p>
          )}
        </div>

        {!hasQuestions ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <span className="text-3xl">📝</span>
            </div>
            <div>
              <p className="text-xl font-medium text-foreground">Форма пуста</p>
              <p className="text-muted-foreground mt-1">
                Добавьте вопросы в редакторе, чтобы увидеть предпросмотр.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {questions
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((question) => {
                if (question.type === "info") {
                  return (
                    <div key={question.id} className="space-y-2 p-5 bg-muted/30 rounded-xl border border-border/50">
                      <p className="text-lg font-medium text-foreground">{question.text || "Информационный блок"}</p>
                      {question.placeholder && (
                        <p className="text-muted-foreground">{question.placeholder}</p>
                      )}
                    </div>
                  );
                }

                const clientType = typeMap[question.type] || "TextField";
                const FormComponent = FormElements[clientType]?.formComponent;
                
                if (!FormComponent) return null;

                const elementInstance = {
                  id: question.id.toString(),
                  type: clientType as keyof typeof FormElements,
                  extraAttributes: getExtraAttributes(question),
                };

                return (
                  <div key={question.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <FormComponent elementInstance={elementInstance} />
                  </div>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}