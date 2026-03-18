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

  console.log("📝 ===== PUBLIC FORM PAGE =====");
  console.log("📝 Hash формы из URL:", hash);
  console.log("📝 Время загрузки:", new Date().toISOString());

  const { form, elements, loading, error } = useLoadPublicForm(hash);
  
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [showThankYou, setShowThankYou] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Логируем загрузку формы
  useEffect(() => {
    if (form) {
      console.log("📝 Форма загружена:", {
        hash: form.hash,
        title: form.title,
        status: form.status,
        questions_count: form.questions?.length,
        visit_count: (form as any).visit_count, // может быть не в публичной версии
      });
      
      // Это момент, когда должно фиксироваться посещение
      console.log("📝 👀 ПОСЕЩЕНИЕ ФОРМЫ - должно увеличить visit_count");
    }
  }, [form]);

  // Логируем каждый ответ
  console.log("📝 Текущие ответы:", answers);

  const handleSubmit = async () => {
    console.log("📝 ===== НАЧАЛО SUBMIT =====");
    console.log("📝 Hash:", hash);
    console.log("📝 Всего ответов:", Object.keys(answers).length);
    
    // Подробный лог каждого ответа
    Object.entries(answers).forEach(([questionId, answer]) => {
      console.log(`📝 Вопрос ${questionId}:`, {
        ответ: answer,
        тип: typeof answer,
        isArray: Array.isArray(answer),
        пустой: answer === null || answer === undefined || answer === '',
        значение: JSON.stringify(answer)
      });
    });

    // Проверяем обязательные поля, если есть такая информация
    if (form?.questions) {
      const requiredQuestions = form.questions.filter(q => q.is_required);
      const missingRequired = requiredQuestions.filter(q => {
        const answer = answers[q.id.toString()];
        return answer === undefined || answer === null || answer === '';
      });
      
      if (missingRequired.length > 0) {
        console.log("📝 ⚠️ Обязательные поля не заполнены:", missingRequired.map(q => q.text));
      }
    }

    setSubmitting(true);
    try {
      console.log("📝 Отправка на сервер...");
      const result = await submitFormResponses(hash, answers);
      
      console.log("📝 Результат от сервера:", result);
      
      // Проверяем, что вернул сервер
      if (result) {
        console.log("📝 Статистика отправки:", {
          success: result.success,
          responses_created: result.responses_created,
          total: result.total,
          message: result.message
        });
      }
      
      setShowThankYou(true);
      console.log("📝 ===== SUBMIT УСПЕШНО ЗАВЕРШЕН =====\n");
    } catch (error) {
      console.error("📝 Ошибка отправки:", error);
      alert("Не удалось отправить ответы");
      console.log("📝 ===== SUBMIT ЗАВЕРШИЛСЯ ОШИБКОЙ =====\n");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswer = (id: string, value: string | string[] | number) => {
    console.log(`📝 Ответ на вопрос ${id}:`, value);
    setAnswers(prev => {
      const newAnswers = { ...prev, [id]: value };
      console.log("📝 Обновленные ответы:", newAnswers);
      return newAnswers;
    });
  };

  if (loading) {
    console.log("📝 Загрузка формы...");
    return <LoadingCat message="Загрузка формы..." />;
  }

  if (error || !form) {
    console.log("📝 Ошибка или форма не найдена:", { error, formExists: !!form });
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-2xl text-muted-foreground">
          {error || "Форма не найдена или недоступна"}
        </p>
      </div>
    );
  }

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