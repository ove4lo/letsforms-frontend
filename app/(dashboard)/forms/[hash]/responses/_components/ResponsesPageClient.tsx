"use client";

import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getResponsesByHash } from "@/lib/form";
import { LoadingCat } from "@/components/ui/loading-cat";
import { ServerResponse } from "@/types/form";

interface GroupedResponses {
  [key: string]: ServerResponse[];
}

interface ResponsesPageClientProps {
  hash: string;
}

export default function ResponsesPageClient({ hash }: ResponsesPageClientProps) {
  const [groupedResponses, setGroupedResponses] = useState<GroupedResponses>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResponses = async () => {
      try {
        setError(null);
        const data = await getResponsesByHash(hash);

        if (!data || !data.responses) {
           setGroupedResponses({});
           return;
        }

        const rawResponses: ServerResponse[] = data.responses || [];

        // Группируем по пользователю (tg_id + username)
        const grouped: GroupedResponses = {};
        rawResponses.forEach((resp) => {
          const key = `${resp.tg_id}-${resp.username}`;
          if (!grouped[key]) {
            grouped[key] = [];
          }
          grouped[key].push(resp);
        });

        // Сортируем ответы внутри группы по order вопроса
        Object.keys(grouped).forEach(key => {
          grouped[key].sort((a, b) => a.question_order - b.question_order);
        });

        setGroupedResponses(grouped);
      } catch (err: any) {
        console.error("Ошибка загрузки ответов:", err);
        setError(err.message || "Не удалось загрузить ответы");
        setTimeout(() => {
            if (window.location.pathname.includes('/auth')) return;
            setLoading(false); 
        }, 2000);
        return; 
      } finally {
        // Сбрасываем loading только если нет ошибки
        if (!error) {
            setLoading(false);
        }
      }
    };

    if (hash) {
      loadResponses();
    }
  }, [hash]);

  // 1. Загрузка или Ожидание редиректа после ошибки
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background">
        <LoadingCat 
          message={error ? "Проверка доступа..." : "Загрузка ответов..."} 
          subMessage={error ? "Перенаправляем на вход" : "Пожалуйста, подождите"} 
        />
      </div>
    );
  }

  // 2. Если ошибка осталась (редирект не сработал)
  if (error) {
     return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-xl font-medium text-muted-foreground mb-4">Не удалось загрузить данные</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-blue-500 hover:underline">Обновить страницу</button>
        </div>
      </div>
     );
  }

  const userKeys = Object.keys(groupedResponses);

  if (userKeys.length === 0) {
    return (
      <div className="min-h-screen w-full bg-background flex items-center justify-center">
        <p className="text-2xl text-muted-foreground">Ответов пока нет</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Ответы на форму</h1>

      <Accordion type="single" collapsible className="w-full">
        {userKeys.map((key, index) => {
          const responses = groupedResponses[key];
          const firstResp = responses[0];
          const username = firstResp.username || "Аноним";
          const createdAt = new Date(firstResp.created_at).toLocaleString("ru-RU");

          return (
            <AccordionItem value={`item-${index}`} key={key}>
              <AccordionTrigger>
                <p className="text-2xl">Ответ #{index + 1} — {username} ({createdAt})</p>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <div className="border-l-4 border-blue-500 pl-6 pr-4 py-6 space-y-8">
                  {responses.map((resp: ServerResponse, i: number) => (
                    <div key={i} className="space-y-2">
                      <p className="text-xl font-bold text-foreground">
                        {resp.question_text || "Вопрос без названия"}
                      </p>
                      <p className="text-xxl text-muted-foreground break-all">
                        {resp.answer !== null && resp.answer !== undefined
                          ? Array.isArray(resp.answer)
                              ? resp.answer.join(", ")
                              : String(resp.answer)
                          : "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}