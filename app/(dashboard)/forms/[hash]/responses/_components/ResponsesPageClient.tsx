"use client";

import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getResponsesByHash } from "@/lib/form";
import { LoadingCat } from "@/components/LoadingCat";
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

  useEffect(() => {
    const loadResponses = async () => {
      try {
        const data = await getResponsesByHash(hash);

        const rawResponses: ServerResponse[] = data?.responses || [];

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
      } catch (error) {
        console.error("Ошибка загрузки ответов:", error);
        // Обработка ошибки, например, установка сообщения об ошибке
      } finally {
        setLoading(false);
      }
    };

    loadResponses();
  }, [hash]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background">
        <LoadingCat message="Загрузка ответов..." subMessage="Пожалуйста, подождите" />
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