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
  questions_count?: number;
  created_at: string;
  status: string;
};

export function FormCard({
  hash,
  title,
  description,
  visit_count = 0,
  response_count = 0,
  questions_count = 0,
  created_at,
  status: initialStatus,
}: Props) {
  const router = useRouter();
  const [publishOpen, setPublishOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [localStatus, setLocalStatus] = useState(initialStatus);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const date = new Date(created_at);

  const statusConfig = {
    draft: { label: "Черновик", variant: "secondary" as const },
    active: { label: "Активна", variant: "default" as const },
    paused: { label: "Приостановлена", variant: "secondary" as const },
    archived: { label: "Архивирована", variant: "outline" as const },
  };

  const statusInfo = statusConfig[localStatus as keyof typeof statusConfig] || statusConfig.draft;
  const hasQuestions = questions_count > 0;

  const handlePublish = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    try {
      setPublishOpen(true);
      setLocalStatus("active");
      await updateFormStatus(hash, "active");
    } catch (error) {
      console.error("Ошибка публикации формы:", error);
      alert("Не удалось опубликовать форму. Попробуйте позже.");
      setLocalStatus(initialStatus);
      setPublishOpen(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!hasQuestions) {
      setShowTooltip(true);
      
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      tooltipTimeoutRef.current = setTimeout(() => {
        setShowTooltip(false);
      }, 3000);
      return;
    }
    
    if (localStatus === "active") {
      setPublishOpen(true);
    } else {
      handlePublish();
    }
  };

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
      className="rounded-xl border bg-card/95 dark:bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-4 relative">
        {showTooltip && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow-lg p-2 min-w-[220px] text-center">
            <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
              ⚠️ Добавьте хотя бы один вопрос
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-1.5">
          <Badge variant={statusInfo.variant} className="text-xs px-2 py-0.5">
            {statusInfo.label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {date.toLocaleDateString("ru-RU")}
          </span>
        </div>

        <h3 className="text-base font-semibold line-clamp-1 mb-1">
          {title}
        </h3>

        <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
          {description || "Без описания"}
        </p>

        <Separator className="my-3" />

        <div className="grid grid-cols-2 gap-2 text-center mb-3">
          <div>
            <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Посещений</p>
            <p className="text-sm font-bold">
              {visit_count?.toLocaleString("ru-RU") || 0}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Ответов</p>
            <p className="text-sm font-bold">
              {response_count?.toLocaleString("ru-RU") || 0}
            </p>
          </div>
        </div>

        <div className="flex gap-1.5">
          <Button
            className="flex-1 h-8 text-xs"
            size="sm"
            onClick={handleEditClick}
            disabled={isUpdating}
          >
            <Edit className="mr-1.5 h-3.5 w-3.5" />
            Редактировать
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleShareClick}
            disabled={isUpdating}
            title={
              !hasQuestions 
                ? "Сначала добавьте вопросы" 
                : isUpdating
                  ? "Публикация..."
                  : localStatus === "active"
                    ? "Поделиться"
                    : "Опубликовать"
            }
          >
            <Share2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>

      <PublishDialog open={publishOpen} onOpenChange={setPublishOpen} hash={hash} />
    </Card>
  );
}