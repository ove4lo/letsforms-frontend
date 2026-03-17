"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { saveForm as saveFormApi } from "@/lib/form";
import useLoadForm from "./useLoadForm";
import useFormStatusActions from "./useFormStatusActions";
import { FormElementInstance } from "@/components/builder/types";
import { FormStatus } from "@/types/form";
import { createNewElement } from "@/components/builder/utils";

export interface UseBuilderReturn {
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

  // Инициализация данных при загрузке формы
  useEffect(() => {
    if (formData) {
      setTitle(formData.title || "Новая форма");
      setDescription(formData.description || "");
      setStatus(formData.status);

      if (formData.questions && formData.questions.length > 0) {
        const restored = formData.questions.map((q: any) => {
          const typeMap: Record<string, string> = {
            text: "TextField", text_area: "TextareaField", single_choice: "RadioField",
            select: "SelectField", multiple_choice: "CheckboxField", number: "NumberField",
            scale: "ScaleField", date: "DateField", info: "ParagraphField",
          };
          
          return {
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
          };
        });
        setElements(restored);
      }
    }
  }, [formData]);

  // Сохранение
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await saveFormApi(hash, { title, elements });
      alert("Форма сохранена!");
      refetch(); // Обновить данные после сохранения
    } catch (err: any) {
      setErrorMessage(`Ошибка сохранения: ${err.message}`);
      setErrorOpen(true);
    } finally {
      setIsSaving(false);
    }
  }, [hash, title, elements, refetch]);

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
    formData, loading, error: loadError,
    title, description, status, elements,
    selectedElement, isSaving, publishOpen, errorOpen, errorMessage,
    setTitle, setDescription, setElements, setSelectedElement,
    handleSave, handleStatusChange, handlePreview,
    setPublishOpen, setErrorOpen,
    refetch
  };
}