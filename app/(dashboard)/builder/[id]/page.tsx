'use client';

import { Designer } from "@/components/builder/Designer";
import { PreviewDialogBtn } from "@/components/builder/PreviewDialogBtn";
import { FormElementInstance } from "@/components/builder/types";
import { useState } from "react";

const initialElements: FormElementInstance[] = [];

export default function BuilderPage({ params }: { params: { id: string } }) {
  const [elements, setElements] = useState<FormElementInstance[]>(initialElements);
  const [selectedElement, setSelectedElement] = useState<FormElementInstance | null>(null);

  return (
    <div className="h-screen w-screen flex flex-col">
      <header className="border-b bg-background px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Редактирование
        </h1>
        <div className="flex gap-3">
          <PreviewDialogBtn elements={elements} />
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Сохранить
          </button>
        </div>
      </header>

      <div className="flex-1 w-full h-full overflow-hidden">
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