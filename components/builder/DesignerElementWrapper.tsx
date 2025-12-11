"use client";

import { useSortable} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { FormElements } from "./elements/FormElements";
import { FormElementInstance } from "./types";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type Props = {
  element: FormElementInstance;
  onRemove: (id: string) => void;
};

export function DesignerElementWrapper({ element, onRemove }: Props) {
  const { id, type } = element;

  const DesignerElement = FormElements[type].designerComponent;

  const topHalf = useDroppable({
    id: `top-${id}`,
    data: {
      type,
      elementId: id,
      isTopHalfDesignerElement: true,
    },
  });

  const bottomHalf = useDroppable({
    id: `bottom-${id}`,
    data: {
      type,
      elementId: id,
      isBottomHalfDesignerElement: true,
    },
  });

  const sortable = useSortable({
    id,
    data: {
      type,
      elementId: id,
      isDesignerElement: true,
    },
  });

  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  return (
    <div
      ref={sortable.setNodeRef}
      style={style}
      {...sortable.attributes}
      {...sortable.listeners}
      className="relative flex flex-col text-foreground bg-background rounded-xl border-2 border-dashed border-transparent transition-all"
    >
      {/* верхняя дроп зона */}
      <div
        ref={topHalf.setNodeRef}
        className={`absolute top-0 left-0 w-full h-1/2 rounded-t-xl ${
          topHalf.isOver ? "bg-blue-500/20" : ""
        }`}
      />

      {/* Элемент */}
      <div className="p-6 bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow">
        <DesignerElement elementInstance={element} />

        {/* Кнопка удаления */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(id);
          }}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>

      {/* дроп зона кнопка */}
      <div
        ref={bottomHalf.setNodeRef}
        className={`absolute bottom-0 left-0 w-full h-1/2 rounded-b-xl ${
          bottomHalf.isOver ? "bg-blue-500/20" : ""
        }`}
      />
    </div>
  );
}