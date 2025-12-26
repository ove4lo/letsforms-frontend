"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getFormByHash, submitFormResponses } from "@/lib/form";
import { FormElementInstance } from "@/components/builder/types";
import { PublicFormElements, PublicElementsType } from "@/components/public-form/elements/PublicFormElements";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LoadingCat } from "@/components/LoadingCat";

export default function PublicFormPage() {
  const params = useParams();
  const hash = params.hash as string;

  const [form, setForm] = useState<any>(null);
  const [elements, setElements] = useState<FormElementInstance[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [loading, setLoading] = useState(true);
  const [showThankYou, setShowThankYou] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadForm() {
      const data = await getFormByHash(hash);
      if (data) {
        setForm(data);

        if (data.questions?.length > 0) {
          const restored = data.questions.map((q: any) => {
            const clientType = mapServerTypeToClient(q.type);

            return {
              id: q.id.toString(),
              type: clientType,
              extraAttributes: {
                label: q.text || "Без названия",
                required: q.is_required || false,
                placeholder: q.placeholder || undefined,
                options: q.options ? (Array.isArray(q.options) ? q.options : []) : undefined,
                min: q.min || undefined,
                max: q.max || undefined,
                min_label: q.min_label || undefined,
                max_label: q.max_label || undefined,
              },
            };
          });
          setElements(restored);
        }
      }
      setLoading(false);
    }

    loadForm();
  }, [hash]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitFormResponses(hash, answers);
      setShowThankYou(true);
    } catch (error) {
      alert("Не удалось отправить ответы");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswer = (id: string, value: string | string[] | number) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const mapServerTypeToClient = (serverType: string): PublicElementsType => {
    const map: Record<string, PublicElementsType> = {
      text: "TextField",
      text_area: "TextareaField",
      single_choice: "RadioField",
      select: "SelectField",
      multiple_choice: "CheckboxField",
      number: "NumberField",
      scale: "ScaleField",
      date: "DateField",
      info: "ParagraphField",
      title: "TitleField",
      subtitle: "SubTitleField",
    };
    return map[serverType] || "TextField";
  };

  if (loading) {
    return <LoadingCat />;
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-2xl text-muted-foreground">Форма не найдена</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{form.title}</CardTitle>
            {form.description && <p className="text-muted-foreground mt-2">{form.description}</p>}
          </CardHeader>
          <CardContent className="space-y-8">
            {elements
              .filter(el => !["SeparatorField", "SpacerField"].includes(el.type))
              .map((element) => {
                const FormComponent = PublicFormElements[element.type as PublicElementsType]?.formComponent;
                if (!FormComponent) return null;

                return (
                  <FormComponent
                    key={element.id}
                    elementInstance={element}
                    submitValue={handleAnswer}
                    isInvalid={false}
                    defaultValue={answers[element.id]}
                  />
                );
              })}

            <div className="text-center pt-6">
              <Button size="lg" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Отправка..." : "Отправить"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showThankYou} onOpenChange={setShowThankYou}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">Спасибо!</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <p className="text-lg">Ваши ответы успешно отправлены</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowThankYou(false)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}