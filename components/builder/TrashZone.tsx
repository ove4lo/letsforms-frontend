"use client";
import { useDroppable } from "@dnd-kit/core";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrashZoneProps {
  isDragging: boolean;
  className?: string;
}

export function TrashZone({ isDragging, className }: TrashZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "trash-zone",
    data: { 
      isTrashZone: true
    }
  });

  if (!isDragging) return null;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[100]", // На всю ширину
        "h-28", // Высота зоны
        "pointer-events-auto",
        "transition-all duration-200",
        // Градиент меняет насыщенность в зависимости от isOver
        isOver 
          ? "bg-gradient-to-t from-red-600/90 via-red-500/60 to-transparent backdrop-blur-sm" 
          : "bg-gradient-to-t from-red-600/30 via-red-500/10 to-transparent",
        className
      )}
    >
      {/* Круг с иконкой - всегда одинаковый */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className={cn(
          "w-12 h-12 rounded-full",
          "flex items-center justify-center",
          "border-2 border-red-400/50 bg-red-500/20", // Статичные стили
          "transition-transform duration-200",
          isOver && "scale-110" // Только немного увеличивается
        )}>
          <Trash2 className="h-5 w-5 text-red-400" /> {/* Статичный цвет */}
        </div>
      </div>
    </div>
  );
}