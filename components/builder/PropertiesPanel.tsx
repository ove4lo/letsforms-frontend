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
    <aside className="fixed inset-y-0 right-0 w-96 bg-card border-l shadow-2xl z-50 flex flex-col">
      {/* Шапка */}
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-semibold">Свойства элемента</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={closePanel}
          className="hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Содержимое */}
      <div className="flex-1 overflow-y-auto p-6">
        <PropertiesComponent
          elementInstance={element}
          updateElement={updateElement}
        />
      </div>
    </aside>
  );
}