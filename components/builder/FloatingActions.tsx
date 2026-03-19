"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface FloatingActionsProps {
  onAddClick: () => void;
  // Убрали лишние пропсы, так как кнопка свойств удалена
}

export function FloatingActions({ onAddClick }: FloatingActionsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!mounted) return null;

  // Показываем кнопку ТОЛЬКО на мобильных
  if (!isMobile) return null;

  return (
    <div className="fixed bottom-6 right-4 z-50 pointer-events-auto">
      {/* Кнопка ДОБАВИТЬ (Плюс) - большая, яркая, всегда видна */}
      <Button
        size="icon"
        onClick={onAddClick}
        className={cn(
          "h-14 w-14 rounded-full shadow-2xl border-2 border-white/20",
          "bg-blue-600 hover:bg-blue-700 text-white",
          "transition-all transform hover:scale-110 active:scale-95",
          "flex items-center justify-center"
        )}
        title="Добавить элемент"
      >
        <Plus className="h-8 w-8" />
      </Button>
    </div>
  );
}