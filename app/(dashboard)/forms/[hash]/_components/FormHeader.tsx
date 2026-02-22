import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Link2, MessageSquare, Trash2 } from "lucide-react";
import { StatusSelector, FormStatus } from "@/components/StatusSelector";
import { Button } from "@/components/ui/button";
import { AdminServerForm } from "@/types/form";

interface FormHeaderProps {
  formData: AdminServerForm;
  onStatusChange: (newStatus: FormStatus) => void;
  isUpdating: boolean;
  onEdit: () => void;
  onViewResponses: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onTakeForm: () => void;
  publishOpen: boolean;
  setPublishOpen: (open: boolean) => void;
}

export default function FormHeader({
  formData,
  onStatusChange,
  isUpdating,
  onEdit,
  onViewResponses,
  onDelete,
  onPublish,
  onTakeForm,
  publishOpen,
  setPublishOpen,
}: FormHeaderProps) {
  // Логика статуса
  const statusConfig = {
    draft: { label: "Черновик", variant: "secondary" as const },
    active: { label: "Активна", variant: "default" as const },
    paused: { label: "Приостановлена", variant: "secondary" as const },
    archived: { label: "Архивирована", variant: "outline" as const },
  };

  const currentStatusInfo = statusConfig[formData.status] || statusConfig.draft;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-4 mb-4">
          <StatusSelector
            currentStatus={formData.status}
            onChange={onStatusChange}
            disabled={isUpdating} // Отключаем при обновлении статуса
          />
        </div>

        <h1 className="text-4xl lg:text-5xl font-bold mb-6">
          {formData.title || "Форма без названия"}
        </h1>
        {formData.description ? (
          <p className="text-xl text-muted-foreground leading-relaxed">
            {formData.description}
          </p>
        ) : (
          <p className="text-xl text-muted-foreground italic">
            Описание не указано
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button onClick={onPublish} variant="default" className="flex items-center gap-2">
          <Link2 className="h-4 w-4" />
          Опубликовать
        </Button>

        <Button onClick={onTakeForm} variant="outline" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Пройти форму
        </Button>

        <Button onClick={onEdit} variant="outline" className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Редактировать
        </Button>

        <Button onClick={onViewResponses} variant="outline" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Ответы
        </Button>

        <Button onClick={onDelete} variant="destructive" className="flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          Удалить
        </Button>
      </div>
    </div>
  );
}