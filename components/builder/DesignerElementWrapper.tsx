"use client";

import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
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

  // ВЕРХНЯЯ ЗОНА (для вставки ПЕРЕД элементом)
  const topDrop = useDroppable({
    id: `top-${id}`,
    data: {
      isDesignerElement: true,
      elementId: id,
      isTopHalf: true, 
    },
  });

  // НИЖНЯЯ ЗОНА (для вставки ПОСЛЕ элемента)
  const bottomDrop = useDroppable({
    id: `bottom-${id}`,
    data: {
      isDesignerElement: true,
      elementId: id,
      isTopHalf: false,
    },
  });

  const sortable = useSortable({
    id,
    data: {
      isDesignerElement: true,
      type,
      elementId: id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  return (
    <div ref={sortable.setNodeRef} style={style} className="relative group mb-4 w-full">
      
      {/* ВЕРХНЯЯ ЛИНИЯ-ИНДИКАТОР */}
      <div
        ref={topDrop.setNodeRef}
        className={cn(
          "absolute -top-3 left-0 right-0 h-6 z-20 flex items-center justify-center transition-all cursor-pointer",
          topDrop.isOver ? "opacity-100" : "opacity-0 group-hover:opacity-40"
        )}
      >
        <div className={cn(
          "w-full h-1 rounded-full transition-colors shadow-sm",
          topDrop.isOver ? "bg-blue-500 scale-105" : "bg-blue-300 dark:bg-blue-700"
        )} />
      </div>

      {/* САМ ЭЛЕМЕНТ */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className={cn(
          "relative p-6 bg-card rounded-xl border-2 transition-all cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md w-full",
          isSelected 
            ? "border-blue-500 ring-2 ring-blue-500/20" 
            : "border-transparent hover:border-muted"
        )}
        {...sortable.attributes}
        {...sortable.listeners}
      >
        {/* Иконка захвата */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground pointer-events-none">
          <GripVertical className="h-5 w-5" />
        </div>

        <DesignerElement elementInstance={element} />

        {/* Кнопка удаления */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* НИЖНЯЯ ЛИНИЯ-ИНДИКАТОР */}
      <div
        ref={bottomDrop.setNodeRef}
        className={cn(
          "absolute -bottom-3 left-0 right-0 h-6 z-20 flex items-center justify-center transition-all cursor-pointer",
          bottomDrop.isOver ? "opacity-100" : "opacity-0 group-hover:opacity-40"
        )}
      >
        <div className={cn(
          "w-full h-1 rounded-full transition-colors shadow-sm",
          bottomDrop.isOver ? "bg-blue-500 scale-105" : "bg-blue-300 dark:bg-blue-700"
        )} />
      </div>
    </div>
  );
}