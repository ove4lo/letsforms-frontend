"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FormElements } from "./elements/FormElements";
import { FormElementInstance } from "./types";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  element: FormElementInstance;
  onRemove: (id: string) => void;
  onSelect: () => void;
  isSelected: boolean;
};

export function DesignerElementWrapper({ element, onRemove, onSelect, isSelected }: Props) {
  const { id, type } = element;
  const DesignerElement = FormElements[type].designerComponent;

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: { type, isDesignerElement: true },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group mb-2">
      <div
        className={cn(
          "relative p-6 bg-card rounded-xl border-2 transition-all shadow-sm w-full",
          isSelected 
            ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20" 
            : "border-transparent hover:border-muted",
          isDragging && "opacity-30 border-dashed scale-[0.98] bg-muted/50"
        )}
      >
        {/* Ручка для перетаскивания */}
        <div
          className="absolute top-3 left-3 text-muted-foreground cursor-grab active:cursor-grabbing touch-none z-30 p-1 rounded hover:bg-muted/50"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-5 w-5" />
        </div>

        {/* Контент (клик для выбора) */}
        <div onClick={(e) => { e.stopPropagation(); onSelect(); }} className="cursor-pointer select-none pl-8">
          <DesignerElement elementInstance={element} />
        </div>

        {/* Кнопка удаления */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-all z-30"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}