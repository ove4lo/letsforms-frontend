"use client";

import { FormElements } from "./elements/FormElements";
import { FormElementInstance } from "./types";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  element: FormElementInstance;
  updateElement: (updated: FormElementInstance) => void;
  closePanel: () => void;
};

export function PropertiesPanel({ element, updateElement, closePanel }: Props) {
  const PropertiesComponent = FormElements[element.type].propertiesComponent;

  return (
    <aside className="w-96 h-full bg-card border-l shadow-xl flex flex-col flex-shrink-0 animate-in slide-in-from-right duration-300">
      {/* Шапка */}
      <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
        <h2 className="text-lg font-bold tracking-tight">Свойства</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={closePanel}
          className="hover:bg-muted rounded-full"
          title="Закрыть"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Содержимое */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <PropertiesComponent
          elementInstance={element}
          updateElement={updateElement}
        />
      </div>
    </aside>
  );
}