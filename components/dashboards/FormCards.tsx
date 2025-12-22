"use client";

import { FormCard } from "./FormCard";

type Props = {
  initialForms: {
    id: number | string;
    title: string;
    description: string | null;
    created_at: string;
    status: string;
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
          key={form.id}
          id={form.id}
          title={form.title}
          description={form.description}
          visits={0}
          submissions={0}
          createdAt={form.created_at}
          status={form.status}
        />
      ))}
    </>
  );
}