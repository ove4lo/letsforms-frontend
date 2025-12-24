"use client";

import { use } from "react";
import { Designer } from "@/components/builder/Designer";
import { PreviewDialogBtn } from "@/components/builder/PreviewDialogBtn";
import { FormElementInstance } from "@/components/builder/types";
import { useState, useEffect } from "react";
import { saveForm, getFormByHash } from "@/lib/form";
import { FormElements } from "@/components/builder/elements/FormElements";
import { LoadingCat } from "@/components/LoadingCat";
import { Textarea } from "@/components/ui/textarea";

export default function BuilderPage({ params }: { params: Promise<{ hash: string }> }) {
  const { hash } = use(params);

  const [formTitle, setFormTitle] = useState("Новая форма");
  const [formDescription, setFormDescription] = useState("");
  const [elements, setElements] = useState<FormElementInstance[]>([]);
  const [selectedElement, setSelectedElement] = useState<FormElementInstance | null>(null);
  const [loading, setLoading] = useState(true);

  // Загружаем форму с сервера
  useEffect(() => {
    async function loadFormFromServer() {
      const data = await getFormByHash(hash);

      if (data) {
        setFormTitle(data.title || "Новая форма");
        setFormDescription(data.description || "");

        if (data.questions && data.questions.length > 0) {
          const restoredElements = data.questions.map((q: any) => {
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

      setLoading(false);
    }

    loadFormFromServer();
  }, [hash]);

  // Fallback на localStorage
  useEffect(() => {
    if (loading) return;

    const saved = localStorage.getItem(`form_${hash}`);
    if (saved && elements.length === 0) {
      try {
        const data = JSON.parse(saved);
        setFormTitle(data.title || formTitle);
        setFormDescription(data.description || formDescription);
        setElements(data.elements || []);
      } catch (e) {
        console.log("Не удалось загрузить из localStorage");
      }
    }
  }, [hash, loading]);

  const handleSave = async () => {
    try {
      await saveForm(hash, {
        title: formTitle,
        elements,
      });

      localStorage.setItem(`form_${hash}`, JSON.stringify({
        title: formTitle,
        description: formDescription,
        elements,
      }));

      alert("Форма успешно сохранена на сервере!");
    } catch (error) {
      alert("Ошибка сохранения на сервере");
      console.error(error);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background">
        <LoadingCat message="Загрузка формы..." subMessage="Пожалуйста, подождите" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col">
      <header className="border-b bg-background px-6 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-5xl">
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

          <div className="flex gap-3">
            <PreviewDialogBtn elements={elements} />

            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Сохранить
            </button>

            <button
              onClick={() => {
                const link = `${window.location.origin}/f/${hash}`;
                navigator.clipboard.writeText(link);
                alert(`Публичная ссылка скопирована!\n\n${link}`);
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              Опубликовать
            </button>
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
    </div>
  );
}