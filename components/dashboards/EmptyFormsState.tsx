import { PlusCircle } from "lucide-react";

export function EmptyFormsState() {
  return (
    <div className="text-center py-16">
      <div className="mx-auto w-32 h-32 bg-muted/50 rounded-full flex items-center justify-center mb-6">
        <PlusCircle className="h-16 w-16 text-muted-foreground/50" />
      </div>
      <h3 className="text-2xl font-semibold text-muted-foreground mb-2">
        У вас пока нет форм
      </h3>
      <p className="text-muted-foreground mb-8">
        Создайте свою первую форму и начните собирать ответы
      </p>
    </div>
  );
}