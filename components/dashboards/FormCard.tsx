"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Edit, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useEffect } from "react";
import { PublishDialog } from "@/components/PublishDialog";
import { updateFormStatus } from "@/lib/form";

type Props = {
  hash: string;
  title: string;
  description?: string | null;
  visit_count?: number;
  response_count?: number;
  conversion_rate?: number;
  created_at: string;
  status: string;
  onStatusChange?: (hash: string, newStatus: string) => void;
};

export function FormCard({
  hash,
  title,
  description,
  visit_count = 0,
  response_count = 0,
  conversion_rate = 0,
  created_at,
  status,
  onStatusChange,
}: Props) {
  const router = useRouter();
  const [publishOpen, setPublishOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const date = new Date(created_at);

  const statusConfig = {
    draft: { label: "Черновик", variant: "secondary" as const },
    active: { label: "Активна", variant: "default" as const },
    paused: { label: "Приостановлена", variant: "secondary" as const },
    archived: { label: "Архивирована", variant: "outline" as const },
  };

  const statusInfo = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

  const hasQuestions = response_count > 0;

  const handlePublish = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    try {
      // Отправляем запрос на сервер для изменения статуса
      await updateFormStatus(hash, "active");
      
      // Обновляем локальный статус через колбэк
      onStatusChange?.(hash, "active");
      
      // Открываем диалог с ссылками
      setPublishOpen(true);
    } catch (error) {
      console.error("Ошибка публикации формы:", error);
      alert("Не удалось опубликовать форму. Попробуйте позже.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!hasQuestions) {
      // Нет вопросов - показываем тултип
      setShowTooltip(true);
      
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      tooltipTimeoutRef.current = setTimeout(() => {
        setShowTooltip(false);
      }, 3000);
      return;
    }
    
    if (status === "active") {
      // Уже активна - сразу показываем ссылки
      setPublishOpen(true);
    } else {
      // Есть вопросы, но не активна - публикуем
      handlePublish();
    }
  };

  // Очищаем таймаут при размонтировании
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/builder/${hash}`);
  };

  const handleCardClick = () => {
    router.push(`/forms/${hash}`);
  };

  return (
    <Card
      className="rounded-xl border bg-card/95 dark:bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer
        border-blue-200 dark:border-transparent
        ring-1 ring-blue-300/20 dark:ring-transparent
        hover:ring-blue-500/50 dark:hover:ring-blue-400/50"
      onClick={handleCardClick}
    >
      <CardContent className="p-5 relative">
        {/* Тултип с подсказкой */}
        {showTooltip && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow-lg p-3 min-w-[250px] text-center">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              ⚠️ Добавьте хотя бы один вопрос, чтобы опубликовать форму
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <Badge variant={statusInfo.variant}>
            {statusInfo.label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {date.toLocaleDateString("ru-RU")}
          </span>
        </div>

        <h3 className="text-lg font-semibold line-clamp-2 mb-2">
          {title}
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {description || "Без описания"}
        </p>

        <Separator className="my-4" />

        {/* Статистика */}
        <div className="grid grid-cols-2 gap-4 text-center mb-4">
          <div>
            <p className="text-muted-foreground text-xs">Посещений</p>
            <p className="text-xl font-bold">
              {visit_count?.toLocaleString("ru-RU") || 0}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Ответов</p>
            <p className="text-xl font-bold">
              {response_count?.toLocaleString("ru-RU") || 0}
            </p>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-2">
          <Button
            className="flex-1"
            size="sm"
            onClick={handleEditClick}
            disabled={isUpdating}
          >
            <Edit className="mr-2 h-4 w-4" />
            Редактировать
          </Button>

          {/* Кнопка "Опубликовать/Поделиться" */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareClick}
            disabled={isUpdating || (!hasQuestions)}
            className={(!hasQuestions || isUpdating) ? "opacity-50 cursor-not-allowed" : ""}
            title={
              !hasQuestions 
                ? "Сначала добавьте вопросы в редакторе" 
                : isUpdating
                  ? "Публикация..."
                  : status === "active"
                    ? "Поделиться формой"
                    : "Опубликовать форму"
            }
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      {/* Модальное окно с ссылками */}
      <PublishDialog open={publishOpen} onOpenChange={setPublishOpen} hash={hash} />
    </Card>
  );
}