"use client";

import { FormElements } from "./elements/FormElements";
import { FormElementInstance } from "./types";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
  element: FormElementInstance;
  updateElement: (updated: FormElementInstance) => void;
  closePanel: () => void;
};

export function PropertiesPanel({ element, updateElement, closePanel }: Props) {
  const PropertiesComponent = FormElements[element.type].propertiesComponent;

  return (
    <aside className="w-full sm:w-96 h-full bg-card border-l shadow-xl flex flex-col flex-shrink-0 animate-in slide-in-from-right duration-300">
      <div className="sticky top-0 z-10 bg-card border-b">
        <div className="flex items-center justify-between p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold tracking-tight">Свойства</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={closePanel}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/30 transition-all"
            title="Закрыть"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>

      {/* Содержимое */}
      <ScrollArea className="flex-1">
        <div className="p-4 sm:p-6">
          <PropertiesComponent
            elementInstance={element}
            updateElement={updateElement}
          />
        </div>
      </ScrollArea>
    </aside>
  );
}