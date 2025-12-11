import { FormCard } from "./FormCard";
import { getMyForms } from "@/lib/form";

export async function FormCards() {
  const forms = await getMyForms(); 

  return (
    <>
      {forms.map((form) => (
        <FormCard
          key={form.id}
          id={form.id}
          title={form.title}
          description={form.description}
          visits={1247}
          submissions={892}
          createdAt={form.created_at}
        />
      ))}
    </>
  );
}