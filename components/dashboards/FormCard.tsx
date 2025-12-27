"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Edit, Share2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { PublishDialog } from "@/components/PublishDialog";

type Props = {
  hash: string;
  title: string;
  description?: string | null;
  visit_count?: number;
  response_count?: number;
  conversion_rate?: number;
  created_at: string;
  status: string;
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
}: Props) {
  const router = useRouter();
  const [publishOpen, setPublishOpen] = useState(false);

  const date = new Date(created_at);

  const statusConfig = {
    draft: { label: "Черновик", variant: "secondary" as const },
    active: { label: "Активна", variant: "default" as const },
    paused: { label: "Приостановлена", variant: "secondary" as const },
    archived: { label: "Архивирована", variant: "outline" as const },
  };

  const statusInfo = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

  return (
    <Card
      className="rounded-xl border bg-card/95 dark:bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer
        border-blue-200 dark:border-transparent
        ring-1 ring-blue-300/20 dark:ring-transparent
        hover:ring-blue-500/50 dark:hover:ring-blue-400/50"
      onClick={() => router.push(`/forms/${hash}`)}
    >
      <CardContent className="p-5">
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
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/builder/${hash}`);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Редактировать
          </Button>

          {/* Кнопка "Опубликовать" с модалкой */}
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setPublishOpen(true);
            }}
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