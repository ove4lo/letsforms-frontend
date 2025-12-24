"use client";

import { FormCard } from "./FormCard";

type Props = {
  initialForms: {
    hash: string;
    title: string;
    description: string | null;
    created_at: string;
    status: string;
    visit_count: number;
    response_count: number;
    conversion_rate: number;
  }[];
};

export function FormCards({ initialForms }: Props) {
  if (initialForms.length === 0) {
    return (
      <div className="col-span-full text-center text-muted-foreground py-12">
        У вас пока нет форм. Создайте первую!
      </div>
    );
  }

  return (
    <>
      {initialForms.map((form) => (
        <FormCard
          key={form.hash}
          hash={form.hash}
          title={form.title}
          description={form.description}
          visit_count={form.visit_count}
          response_count={form.response_count}
          conversion_rate={form.conversion_rate}
          created_at={form.created_at}
          status={form.status}
        />
      ))}
    </>
  );
}