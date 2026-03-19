"use client";
import { useDroppable } from "@dnd-kit/core";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface TrashZoneProps {
  isDragging: boolean;
  className?: string;
}

export function TrashZone({ isDragging, className }: TrashZoneProps) {
  const [isMobile, setIsMobile] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: "trash-zone",
    data: { isTrashZone: true },
  });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!isDragging || isMobile) return null;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[100]",
        "h-20", 
        "pointer-events-auto",
        className
      )}
    >
      {/* Видимая плашка по центру */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
        <div
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-full",
            "border text-sm font-medium",
            "transition-all duration-200 ease-out",
            "shadow-lg",
            isOver
              ? "bg-red-500 border-red-400 text-white scale-110 shadow-red-500/40"
              : "bg-background/90 border-red-400/60 text-red-400 backdrop-blur-sm scale-100"
          )}
        >
          <Trash2
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOver && "scale-110"
            )}
          />
          <span>{isOver ? "Отпустите для удаления" : "Удалить"}</span>
        </div>
      </div>
    </div>
  );
}