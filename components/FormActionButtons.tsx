"use client";

import { Button } from "@/components/ui/button";
import { Edit, Eye, Link2, MessageSquare, Trash2, Save, Play } from "lucide-react";
import { FormStatus } from "@/types/form";

interface BaseButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function EditButton({ onClick, disabled, className }: BaseButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      disabled={disabled}
      className={`flex items-center gap-2 ${className}`}
    >
      <Edit className="h-4 w-4" />
      Редактировать
    </Button>
  );
}

export function PreviewButton({ onClick, disabled, className }: BaseButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      disabled={disabled}
      className={`flex items-center gap-2 ${className}`}
    >
      <Eye className="h-4 w-4" />
      Предпросмотр
    </Button>
  );
}

export function TakeFormButton({ onClick, disabled, className }: BaseButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      disabled={disabled}
      className={`flex items-center gap-2 ${className}`}
    >
      <Play className="h-4 w-4" />
      Пройти форму
    </Button>
  );
}

export function ResponsesButton({ onClick, disabled, className }: BaseButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      disabled={disabled}
      className={`flex items-center gap-2 ${className}`}
    >
      <MessageSquare className="h-4 w-4" />
      Ответы
    </Button>
  );
}

export function DeleteButton({ onClick, disabled, className }: BaseButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="destructive"
      disabled={disabled}
      className={`flex items-center gap-2 ${className}`}
    >
      <Trash2 className="h-4 w-4" />
      Удалить
    </Button>
  );
}

export function SaveButton({ onClick, disabled, className }: BaseButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="default"
      disabled={disabled}
      className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 ${className}`}
    >
      <Save className="h-4 w-4" />
      Сохранить
    </Button>
  );
}

interface PublishButtonProps extends BaseButtonProps {
  status: FormStatus;
}

export function PublishButton({ onClick, disabled, status, className }: PublishButtonProps) {
  // Если форма уже активна, показываем обычную кнопку публикации
  if (status === "active") {
    return (
      <Button
        onClick={onClick}
        variant="default"
        disabled={disabled}
        className={`flex items-center gap-2 ${className}`}
      >
        <Link2 className="h-4 w-4" />
        Опубликовать
      </Button>
    );
  }

  // Если форма не активна, показываем кнопку активации
  return (
    <Button
      onClick={onClick}
      variant="default"
      disabled={disabled}
      className={`flex items-center gap-2 bg-green-600 hover:bg-green-700 ${className}`}
    >
      <Link2 className="h-4 w-4" />
      Опубликовать
    </Button>
  );
}