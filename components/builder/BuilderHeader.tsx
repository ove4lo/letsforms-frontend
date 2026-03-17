"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StatusSelector, FormStatus } from "@/components/StatusSelector";
import { Eye, Save } from "lucide-react";

interface BuilderHeaderProps {
  title: string;
  description: string;
  status: FormStatus;
  isSaving: boolean;
  hasQuestions: boolean;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSave: () => void;
  onStatusChange: (s: FormStatus) => void;
  onPreview: () => void;
}

export function BuilderHeader({
  title, description, status, isSaving, hasQuestions,
  onTitleChange, onDescriptionChange, onSave, onStatusChange, onPreview
}: BuilderHeaderProps) {
  return (
    <header className="flex-shrink-0 border-b bg-card/50 backdrop-blur-sm p-4 z-20 relative w-full">
      <div className="max-w-7xl mx-auto w-full space-y-4">
        {/* Поля ввода (без изменений) */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4">
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="text-2xl font-bold bg-transparent border-b border-transparent hover:border-input focus:border-primary focus:ring-0 outline-none transition px-2 py-1 w-full"
            placeholder="Название формы"
          />
          <Textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Описание формы"
            className="text-muted-foreground resize-none bg-transparent border-b border-transparent hover:border-input focus:border-primary focus:ring-0 outline-none transition min-h-[40px] px-2 py-1 w-full"
            rows={1}
          />
        </div>

        {/* Кнопки */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={onPreview} className="gap-2 whitespace-nowrap">
            <Eye className="h-4 w-4" /> Предпросмотр
          </Button>
          
          {/* КНОПКА СОХРАНИТЬ ТЕПЕРЬ DISABLED, ЕСЛИ НЕТ ВОПРОСОВ */}
          <Button 
            variant="default" 
            size="sm" 
            onClick={onSave} 
            disabled={isSaving || !hasQuestions} 
            className="gap-2 whitespace-nowrap"
          >
            <Save className={`h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving ? "Сохранение..." : "Сохранить"}
          </Button>

          <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

          <div className="flex-1 min-w-[200px]">
             <StatusSelector currentStatus={status} onChange={onStatusChange} disabled={!hasQuestions} />
          </div>

          {!hasQuestions && (
            <span className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-md border border-yellow-200 dark:border-yellow-800 whitespace-nowrap animate-pulse">
              ⚠️ Добавьте вопросы для сохранения
            </span>
          )}
        </div>
      </div>
    </header>
  );
}