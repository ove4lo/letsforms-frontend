"use client";

import { use } from "react";
import { Designer } from "@/components/builder/Designer";
import { PreviewDialogBtn } from "@/components/builder/PreviewDialogBtn";
import { FormElementInstance } from "@/components/builder/types";
import { useState, useEffect } from "react";
import { saveForm } from "@/lib/form";

export default function BuilderPage({ params }: { params: Promise<{ hash: string }> }) {
  const { hash } = use(params);

  const [formTitle, setFormTitle] = useState("Новая форма");
  const [elements, setElements] = useState<FormElementInstance[]>([]);
  const [selectedElement, setSelectedElement] = useState<FormElementInstance | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`form_${hash}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setFormTitle(data.title || "Новая форма");
        setElements(data.elements || []);
      } catch (e) {
        console.log("Не удалось загрузить из localStorage");
      }
    }
  }, [hash]);

  const handleSave = async () => {
    const elementsForServer = elements
      .filter(el => !["SeparatorField", "SpacerField"].includes(el.type))
      .map(el => ({
        type: mapClientTypeToServer(el.type),
        text: el.extraAttributes?.label || "Без названия",
        is_required: !!el.extraAttributes?.required,
        options: el.extraAttributes?.options || null,
      }));

    try {
      await saveForm(hash, {
        title: formTitle,
        elements: elementsForServer,
      });

      // Сохраняем в localStorage 
      localStorage.setItem(`form_${hash}`, JSON.stringify({
        title: formTitle,
        elements,
      }));

      alert("Форма успешно сохранена на сервере!");
    } catch (error) {
      alert("Ошибка сохранения на сервере");
      console.error(error);
    }
  };

  const mapClientTypeToServer = (type: string): string => {
    const map: Record<string, string> = {
      TextField: "text",
      TextareaField: "text",
      SelectField: "single_choice",
      RadioField: "single_choice",
      CheckboxField: "multiple_choice",
      NumberField: "number",
      ScaleField: "scale",
      DateField: "date",
      TitleField: "info",
      SubTitleField: "info",
      ParagraphField: "info",
    };
    return map[type] || "text";
  };

  return (
    <div className="h-screen w-screen flex flex-col">
      <header className="border-b bg-background px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <input
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="text-2xl font-bold bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
            placeholder="Название формы"
          />
        </div>

        <div className="flex gap-3">
          <PreviewDialogBtn elements={elements} />

          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Сохранить на сервере
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