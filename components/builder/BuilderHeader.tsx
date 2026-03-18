"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StatusSelector, FormStatus } from "@/components/StatusSelector";
import { PreviewDialogBtn } from "./PreviewDialogBtn";
import { Save } from "lucide-react";
import { FormElementInstance } from "./types";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface BuilderHeaderProps {
  title: string;
  description: string;
  status: FormStatus;
  isSaving: boolean;
  hasQuestions: boolean;
  hasDraft?: boolean;
  elements: FormElementInstance[];
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSave: () => void;
  onStatusChange: (s: FormStatus) => void;
}

export function BuilderHeader({
  title,
  description,
  status,
  isSaving,
  hasQuestions,
  hasDraft,
  elements,
  onTitleChange,
  onDescriptionChange,
  onSave,
  onStatusChange,
}: BuilderHeaderProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Предотвращаем гидратацию
  if (!mounted) {
    return null;
  }

  return (
    <header className="flex-shrink-0 border-b bg-card/50 backdrop-blur-sm p-3 sm:p-4 z-20 relative w-full">
      <div className="max-w-7xl mx-auto w-full space-y-3 sm:space-y-4">
        {/* СТРОКА 1: название */}
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="text-xl sm:text-2xl font-bold bg-transparent border-b border-transparent hover:border-input focus:border-primary focus:ring-0 outline-none transition px-2 py-1 w-full truncate"
              placeholder="Название формы"
            />
          </div>
        </div>

        {/* СТРОКА 2: Описание */}
        <div className="w-full">
          <Textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Описание формы"
            className="text-sm sm:text-base text-muted-foreground resize-none bg-transparent border-b border-transparent hover:border-input focus:border-primary focus:ring-0 outline-none transition min-h-[40px] px-2 py-1 w-full"
            rows={1}
          />
        </div>

        {/* СТРОКА 3: Все кнопки в одной строке */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
          {/* Предпросмотр */}
          <PreviewDialogBtn elements={elements} isMobile={isMobile} />

          {/* Сохранить */}
          <Button
            variant="default"
            size="sm"
            onClick={onSave}
            disabled={isSaving || !hasQuestions}
            className={cn(
              "gap-2 rounded-full",
              isMobile ? "px-3" : "px-4"
            )}
          >
            <Save className={`h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving ? "Сохранение..." : "Сохранить"}
          </Button>

          {/* Статус */}
          <div className={cn(
            "min-w-[140px] sm:min-w-[180px]",
            isMobile && "flex-1"
          )}>
            <StatusSelector
              currentStatus={status}
              onChange={onStatusChange}
              disabled={!hasQuestions}
            />
          </div>

          {/* Предупреждение, если нет вопросов */}
          {!hasQuestions && (
            <span className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1.5 rounded-full border border-yellow-200 dark:border-yellow-800 inline-flex items-center gap-1">
              ⚠️ Добавьте вопросы для сохранения
            </span>
          )}
        </div>
      </div>
    </header>
  );
}