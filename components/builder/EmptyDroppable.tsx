"use client";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface EmptyDroppableProps {
  className?: string;
}

export function EmptyDroppable({ className }: EmptyDroppableProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "empty-droppable",
    data: {
      isDesignerElement: true,
      isEmptyZone: true
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "h-96 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-background/50 transition-all duration-300",
        isOver ? "border-blue-500 bg-blue-500/5 scale-[1.02]" : "border-muted-foreground/25",
        className
      )}
    >
      {isOver ? (
        <>
          <p className="text-lg font-medium text-blue-600 animate-pulse">
            Отпустите, чтобы добавить
          </p>
          <p className="text-sm text-muted-foreground/70 mt-2">
            Элемент появится здесь
          </p>
        </>
      ) : (
        <>
          <p className="text-lg font-medium">Рабочая область пуста</p>
          <p className="text-sm text-muted-foreground/70 mt-2">
            Перетащите элементы сюда
          </p>
        </>
      )}
    </div>
  );
}