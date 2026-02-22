"use client";

import { FormElementInstance } from "@/components/builder/types";
import { FormElements } from "@/components/builder/elements/FormElements";
import { StatusSelector, FormStatus } from "@/components/StatusSelector"; 
import { useState, useEffect } from "react";
import { saveForm } from "@/lib/form"; 
import { LoadingCat } from "@/components/LoadingCat";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import { PublishDialog } from "@/components/PublishDialog";
import { ErrorDialog } from "@/components/ErrorDialog";
import { Designer } from "@/components/builder/Designer";
import { PreviewDialogBtn } from "@/components/builder/PreviewDialogBtn";
import { useRouter } from "next/navigation";
import useLoadForm from "@/hooks/useLoadForm"; 
import useFormStatusActions from "@/hooks/useFormStatusActions";
import { AdminServerForm } from "@/types/form"; // Используем типы

interface BuilderPageClientProps {
  hash: string; // Принимаем hash из родительского серверного компонента
}

export default function BuilderPageClient({ hash }: BuilderPageClientProps) {
  const router = useRouter();

  // Используем хук для загрузки данных
  const { formData, loading: loadingForm, error: loadError, refetch } = useLoadForm(hash);

  // Используем хук для действий со статусом
  const { isUpdating: isStatusUpdating, error: statusError, updateStatus } = useFormStatusActions();

  // Состояния для редактируемых данных
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStatus, setFormStatus] = useState<FormStatus>("draft");
  const [elements, setElements] = useState<FormElementInstance[]>([]);
  const [selectedElement, setSelectedElement] = useState<FormElementInstance | null>(null);

  const [loading, setLoading] = useState(true); // Общее состояние загрузки
  const [publishOpen, setPublishOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Синхронизируем локальное состояние с данными формы при её загрузке
  useEffect(() => {
    if (formData) {
      setFormTitle(formData.title || "Новая форма");
      setFormDescription(formData.description || "");
      setFormStatus(formData.status);
      // Восстанавливаем элементы из вопросов
      if (formData.questions && formData.questions.length > 0) {
        const restoredElements = formData.questions.map((q: any) => { 
          const clientType = mapServerTypeToClient(q.type);

          return {
            id: q.id.toString(),
            type: clientType,
            extraAttributes: {
              label: q.text || "Без названия",
              required: q.is_required || false,
              options: q.options
                ? (Array.isArray(q.options)
                  ? q.options
                  : q.options.split(",").map((s: string) => s.trim())
                )
                : undefined,
              placeholder: q.placeholder || undefined,
              min: q.min || undefined,
              max: q.max || undefined,
              min_label: q.min_label || undefined,
              max_label: q.max_label || undefined,
            },
          };
        });
        setElements(restoredElements);
      }
    }
    // Устанавливаем общий флаг загрузки в false, когда данные формы загружены
    setLoading(false);
  }, [formData]);

  if (loadError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-xl text-destructive">Ошибка: {loadError}</p>
      </div>
    );
  }

  // Если загрузка, показываем спиннер
  if (loading || loadingForm) { // Проверяем оба состояния
    return (
      <div className="min-h-screen w-full bg-background">
        <LoadingCat message="Загрузка формы..." subMessage="Пожалуйста, подождите" />
      </div>
    );
  }

  // Если форма не найдена (formData === null), показываем сообщение
  if (!formData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Форма не найдена</p>
      </div>
    );
  }

  // Обработчик сохранения формы
  const handleSave = async () => {
    try {
      await saveForm(hash, {
        title: formTitle,
        elements,
      });

      alert("Форма успешно сохранена на сервере!");
    } catch (error: any) {
      console.error("Ошибка сохранения формы:", error);
      alert(`Ошибка сохранения на сервере: ${error.message || "Неизвестная ошибка"}`);
    }
  };

  // Обработчик публикации/изменения статуса
  const handleStatusChange = async (newStatus: FormStatus) => {
    // Проверка на пустую форму при попытке активации
    if (newStatus === "active" && elements.length === 0) {
      setErrorMessage("Нельзя опубликовать форму без вопросов. Добавьте хотя бы один вопрос.");
      setErrorOpen(true);
      return; 
    }

    // Если статус не меняется, выходим
    if (newStatus === formStatus) {
      return;
    }

    try {
      // Обновляем статус через хук
      await updateStatus(hash, newStatus);
      // Обновляем локальное состояние
      setFormStatus(newStatus);
      // Обновляем formData через refetch, чтобы синхронизировать с сервером
      refetch();

      // Если активируем, открываем диалог публикации
      if (newStatus === "active") {
        setPublishOpen(true);
      }
    } catch (error: any) {
      console.error("Ошибка обновления статуса:", error);
      // Сообщение об ошибке уже установлено в хуке
      setErrorMessage(statusError || "Ошибка обновления статуса формы.");
      setErrorOpen(true);
    }
  };

  // Копирование ссылки
  const copyLink = (type: "web" | "tg") => {
    let link = "";
    if (type === "web") {
      link = `${window.location.origin}/f/${hash}`;
    } else {
      link = `t.me/${process.env.NEXT_PUBLIC_BOT_NAME}?start=form_${hash}`;
    }
    navigator.clipboard.writeText(link);
  };

  // Маппинг типов сервера на клиент
  const mapServerTypeToClient = (serverType: string): keyof typeof FormElements => {
    const map: Record<string, keyof typeof FormElements> = {
      text: "TextField",
      text_area: "TextareaField",
      single_choice: "RadioField",
      select: "SelectField",
      multiple_choice: "CheckboxField",
      number: "NumberField",
      scale: "ScaleField",
      date: "DateField",
      info: "ParagraphField",
    };
    return map[serverType] || "TextField";
  };

  return (
    <div className="h-screen w-screen flex flex-col">
      <header className="border-b bg-background px-6 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-5xl flex items-center gap-4">
            <div className="flex-1">
              <input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="text-3xl font-bold bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-full"
                placeholder="Название формы"
              />
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Описание формы (необязательно)"
                className="mt-2 text-muted-foreground resize-none bg-transparent"
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <PreviewDialogBtn elements={elements} />

            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Сохранить
            </button>

            <StatusSelector
              currentStatus={formStatus}
              onChange={handleStatusChange}
              disabled={isStatusUpdating}
            />

            {formStatus === "active" && (
              <Button onClick={() => setPublishOpen(true)} variant="outline" className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Опубликовать
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1">
        <Designer
          elements={elements}
          onElementsChange={setElements}
          selectedElement={selectedElement}
          onSelectedElementChange={setSelectedElement}
        />
      </div>

      <PublishDialog open={publishOpen} onOpenChange={setPublishOpen} hash={hash} />

      <ErrorDialog
        open={errorOpen}
        onOpenChange={setErrorOpen}
        errorMessage={errorMessage}
        title="Ошибка"
      />
    </div>
  );
}