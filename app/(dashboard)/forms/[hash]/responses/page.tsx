"use client";

import { use } from "react";
import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getResponsesByHash } from "@/lib/form"; 
import { LoadingCat } from "@/components/LoadingCat";

export default function ResponsesPage({ params }: { params: Promise<{ hash: string }> }) {
  const { hash } = use(params);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResponses() {
      const data = await getResponsesByHash(hash);
      setResponses(data || []);
      setLoading(false);
    }

    loadResponses();
  }, [hash]);

  if (loading) {
    return <LoadingCat message="Загрузка ответов..." />;
  }

  if (responses.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-2xl text-muted-foreground">Ответов пока нет</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Ответы на форму</h1>

      <Accordion type="single" collapsible className="w-full">
        {responses.map((response, index) => (
          <AccordionItem value={`item-${index}`} key={index}>
            <AccordionTrigger>
              Ответ #{index + 1} — {response.username || "Аноним"} ({new Date(response.created_at).toLocaleString()})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {response.answers.map((ans: any, i: number) => (
                  <div key={i} className="border-l-4 border-blue-500 pl-4">
                    <p className="font-medium">{ans.question_text}</p>
                    <p className="text-muted-foreground mt-1">
                      {ans.answer || "—"}
                    </p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}