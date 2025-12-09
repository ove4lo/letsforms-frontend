import { FormCard } from "./FormCard";
import { getMyForms } from "@/lib/form";

export async function FormCards() {
  const forms = await getMyForms(); 

  if (forms.length === 0) {
    return (
      <div className="col-span-full text-center py-16">
        <div className="mx-auto max-w-sm">
          <div className="bg-muted/50 border-2 border-dashed rounded-xl h-32 w-32 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-muted-foreground mb-2">
            У вас пока нет форм
          </h3>
          <p className="text-muted-foreground">
            Создайте свою первую форму, нажав на карточку слева
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {forms.map((form) => (
        <FormCard
          key={form.id}
          id={form.id}
          title={form.title}
          description={form.description}
          visits={0} 
          submissions={0}
          createdAt={form.created_at}
        />
      ))}
    </>
  );
}