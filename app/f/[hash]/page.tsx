"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { submitFormResponses } from "@/lib/form";
import { PublicFormElements } from "@/components/public-form/elements/PublicFormElements";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LoadingCat } from "@/components/LoadingCat";
import useLoadPublicForm from "@/hooks/useLoadPublicForm";

export default function PublicFormPage() {
  const params = useParams();
  const router = useRouter();
  const hash = params.hash as string;

  const { form, elements, loading, error } = useLoadPublicForm(hash);
  
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [showThankYou, setShowThankYou] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
  }, [form]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitFormResponses(hash, answers);
      setShowThankYou(true);
    } catch (error) {
      console.error("📝 Ошибка отправки:", error);
      alert("Не удалось отправить ответы");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswer = (id: string, value: string | string[] | number) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  // 1. Загрузка
  if (loading) {
    return <LoadingCat message="Загрузка формы..." subMessage="Получаем данные" />;
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingCat 
          message="Проверка доступа..." 
          subMessage="Перенаправляем на вход" 
        />
      </div>
    );
  }

  // 3. Рендер формы
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{form.title}</CardTitle>
            {form.description && (
              <p className="text-muted-foreground mt-2">{form.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-8">
            {elements
              .filter(el => !["SeparatorField", "SpacerField"].includes(el.type))
              .map((element) => {
                const FormComponent = PublicFormElements[element.type as keyof typeof PublicFormElements]?.formComponent;
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