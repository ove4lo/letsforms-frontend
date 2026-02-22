// app/forms/[hash]/_components/FormHeader.tsx
import { Badge } from "@/components/ui/badge";
import { StatusSelector, FormStatus } from "@/components/StatusSelector";
import { 
  EditButton, 
  TakeFormButton, 
  ResponsesButton, 
  DeleteButton,
  PublishButton 
} from "@/components/FormActionButtons";
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
  hasQuestions: boolean;
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
  hasQuestions,
}: FormHeaderProps) {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-4 mb-4">
          <StatusSelector
            currentStatus={formData.status}
            onChange={onStatusChange}
            disabled={isUpdating}
          />
        </div>

        {/* Название формы */}
        <h1 className="text-2xl lg:text-3xl font-bold mb-6">
          {formData.title || "Форма без названия"}
        </h1>
        
        {/* Описание формы */}
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

      <div className="flex flex-wrap gap-3">
        {/* Кнопка публикации/активации - доступна только если есть вопросы */}
        <PublishButton 
          onClick={onPublish} 
          status={formData.status}
          disabled={isUpdating || !hasQuestions} 
        />

        {/* Кнопка "Пройти форму" - доступна только если есть вопросы */}
        <TakeFormButton 
          onClick={onTakeForm} 
          disabled={!hasQuestions} 
        />

        <EditButton onClick={onEdit} />

        {/* Кнопка "Ответы" - доступна только если есть вопросы */}
        <ResponsesButton 
          onClick={onViewResponses} 
          disabled={!hasQuestions} 
        />

        <DeleteButton onClick={onDelete} />
      </div>

      {/* Подсказка для пустой формы */}
      {!hasQuestions && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Форма пуста. Добавьте вопросы в редакторе, чтобы активировать кнопки "Пройти форму", "Ответы" и "Опубликовать".
          </p>
        </div>
      )}
    </div>
  );
}