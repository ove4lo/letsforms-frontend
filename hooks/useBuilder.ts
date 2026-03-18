"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { saveForm as saveFormApi } from "@/lib/form";
import useLoadForm from "./useLoadForm";
import useFormStatusActions from "./useFormStatusActions";
import { FormElementInstance } from "@/components/builder/types";
import { FormStatus } from "@/types/form";
import { createNewElement } from "@/components/builder/utils";

interface UseBuilderReturn {
  // Данные
  formData: any;
  loading: boolean;
  error: string | null;
  
  // Состояния формы
  title: string;
  description: string;
  status: FormStatus;
  elements: FormElementInstance[];
  
  // UI состояния
  selectedElement: FormElementInstance | null;
  isSaving: boolean;
  publishOpen: boolean;
  errorOpen: boolean;
  errorMessage: string;

  // Действия
  setTitle: (v: string) => void;
  setDescription: (v: string) => void;
  setElements: (v: FormElementInstance[]) => void;
  setSelectedElement: (el: FormElementInstance | null) => void;
  
  // Handlers
  handleSave: () => Promise<void>;
  handleStatusChange: (newStatus: FormStatus) => Promise<void>;
  handlePreview: () => void;
  setPublishOpen: (v: boolean) => void;
  setErrorOpen: (v: boolean) => void;
  
  // Refetch
  refetch: () => void;
}

export function useBuilder(hash: string): UseBuilderReturn {
  const router = useRouter();
  const { formData, loading, error: loadError, refetch } = useLoadForm(hash);
  const { isUpdating, updateStatus } = useFormStatusActions();

  // Локальные состояния
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<FormStatus>("draft");
  const [elements, setElements] = useState<FormElementInstance[]>([]);
  const [selectedElement, setSelectedElement] = useState<FormElementInstance | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // --- ЛОГИКА ЧЕРНОВИКОВ (LocalStorage) ---
  const storageKey = `draft_form_${hash}`;

  // 1. Загрузка данных (Сервер -> Черновик -> Стейт)
  useEffect(() => {
    if (!loading && formData) {
      // Данные с сервера
      const serverTitle = formData.title || "Новая форма";
      const serverDesc = formData.description || "";
      const serverStatus = formData.status;
      
      let serverElements: FormElementInstance[] = [];
      if (formData.questions && formData.questions.length > 0) {
        const typeMap: Record<string, string> = {
          text: "TextField", text_area: "TextareaField", single_choice: "RadioField",
          select: "SelectField", multiple_choice: "CheckboxField", number: "NumberField",
          scale: "ScaleField", date: "DateField", info: "ParagraphField",
        };
        serverElements = formData.questions.map((q: any) => ({
          id: q.id.toString(),
          type: (typeMap[q.type] || "TextField") as any,
          extraAttributes: {
            label: q.text || "Без названия",
            required: q.is_required || false,
            options: q.options ? (Array.isArray(q.options) ? q.options : q.options.split(",").map((s:string) => s.trim())) : undefined,
            placeholder: q.placeholder || undefined,
            min: q.min, max: q.max,
            min_label: q.min_label, max_label: q.max_label,
            text: q.text, 
          },
        }));
      }

      // Проверяем черновик
      const savedDraft = localStorage.getItem(storageKey);
      
      if (savedDraft) {
        // Если есть черновик, спрашиваем пользователя (через простой confirm для начала, или можно сделать модалку)
        // Для MVP: если черновик новее 5 минут или просто есть - восстанавливаем тихо, 
        // но в реальном проекте лучше показывать диалог. 
        // Здесь реализуем простую логику: если черновик есть, берем его.
        try {
          const draft = JSON.parse(savedDraft);
          setTitle(draft.title);
          setDescription(draft.description);
          setElements(draft.elements);
          setStatus(serverStatus); // Статус берем с сервера
          return;
        } catch (e) {
          console.error("Ошибка чтения черновика", e);
          localStorage.removeItem(storageKey);
        }
      }

      // Если черновика нет или ошибка - берем данные с сервера
      setTitle(serverTitle);
      setDescription(serverDesc);
      setElements(serverElements);
      setStatus(serverStatus);
    }
  }, [loading, formData, hash]);

  // 2. Автосохранение при изменениях
  useEffect(() => {
    if (!loading && formData && title) {
      // Сохраняем только если данные уже загружены
      const draft = {
        title,
        description,
        elements,
        timestamp: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(draft));
    }
  }, [title, description, elements, loading, formData, hash]);

  // Функция очистки черновика (вызывается после успешного сохранения)
  const clearDraft = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, [hash]);

  // Обработчик сохранения на сервер
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await saveFormApi(hash, { title, elements });
      alert("Форма успешно сохранена!");
      clearDraft(); // Очищаем черновик
      refetch(); // Обновляем данные с сервера
    } catch (err: any) {
      setErrorMessage(`Ошибка сохранения: ${err.message}`);
      setErrorOpen(true);
    } finally {
      setIsSaving(false);
    }
  }, [hash, title, elements, clearDraft, refetch]);

  // Смена статуса
  const handleStatusChange = useCallback(async (newStatus: FormStatus) => {
    const hasQuestions = elements.some(el => 
      !["ParagraphField", "TitleField", "SubTitleField", "SeparatorField", "SpacerField"].includes(el.type)
    );

    if (newStatus === "active" && !hasQuestions) {
      setErrorMessage("Нельзя опубликовать пустую форму.");
      setErrorOpen(true);
      return;
    }

    if (newStatus === status) return;

    try {
      await updateStatus(hash, newStatus);
      setStatus(newStatus);
      if (newStatus === "active") setPublishOpen(true);
    } catch (err: any) {
      setErrorMessage("Не удалось изменить статус");
      setErrorOpen(true);
    }
  }, [elements, status, hash, updateStatus]);

  const handlePreview = useCallback(() => {
    window.open(`/f/${hash}`, "_blank");
  }, [hash]);

  return {
    formData, loading, error: loadError, refetch,
    title, description, status, elements,
    selectedElement, isSaving, publishOpen, errorOpen, errorMessage,
    setTitle, setDescription, setElements, setSelectedElement,
    handleSave, handleStatusChange, handlePreview,
    setPublishOpen, setErrorOpen,
  };
}