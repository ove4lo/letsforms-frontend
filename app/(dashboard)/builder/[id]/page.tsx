// app/(dashboard)/builder/[id]/page.tsx
"use client";

import { use } from "react";
import { Designer } from "@/components/builder/Designer";
import { PreviewDialogBtn } from "@/components/builder/PreviewDialogBtn";
import { FormElementInstance } from "@/components/builder/types";
import { useState, useEffect } from "react";

export default function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // ← правильно читаем id

  const [formTitle, setFormTitle] = useState("Новая форма");
  const [elements, setElements] = useState<FormElementInstance[]>([]);
  const [selectedElement, setSelectedElement] = useState<FormElementInstance | null>(null);

  // Восстановление формы при загрузке
  useEffect(() => {
    const saved = localStorage.getItem(`form_${id}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setFormTitle(data.title || "Новая форма");
        const restoredElements = data.elements.map((el: any) => ({
          id: el.id,
          type: el.type,
          extraAttributes: { ...el }, // ← все настройки сохранены!
        }));
        setElements(restoredElements);
      } catch (e) {
        console.log("Не удалось загрузить форму");
      }
    }
  }, [id]);

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Шапка */}
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
            onClick={() => {
              const formJson = {
                id,
                title: formTitle,
                createdAt: new Date().toISOString(),
                elements: elements.map(el => ({
                  id: el.id,
                  type: el.type,
                  ...el.extraAttributes,
                })),
              };

              const jsonString = JSON.stringify(formJson, null, 2);
              console.log("Форма сохранена:", jsonString);
              localStorage.setItem(`form_${id}`, jsonString);
              alert("Форма сохранена!");
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Сохранить
          </button>

          <button
            onClick={() => {
              const link = `${window.location.origin}/f/${id}`;
              navigator.clipboard.writeText(link);
              alert(`Ссылка скопирована!\n\n${link}`);
            }}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            Опубликовать
          </button>
        </div>
      </header>

      {/* Конструктор */}
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