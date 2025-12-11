"use client";

import { FormElements } from "./elements/FormElements";
import { Separator } from "@/components/ui/separator";
import { useDraggable } from "@dnd-kit/core";

type ElementType = keyof typeof FormElements;

const elements = [
  { type: "TitleField", label: "Заголовок" },
  { type: "SubTitleField", label: "Подзаголовок" },
  { type: "ParagraphField", label: "Параграф" },
  { type: "SeparatorField", label: "Разделитель" },
  { type: "SpacerField", label: "Отступ" },
  { type: "TextField", label: "Текстовое поле" },
  { type: "NumberField", label: "Числовое поле" },
  { type: "TextareaField", label: "Текстовая область" },
  { type: "DateField", label: "Дата" },
  { type: "SelectField", label: "Выпадающий список" },
  { type: "CheckboxField", label: "Чекбокс" },
] as const;

function SidebarBtnElement({ type }: { type: ElementType }) {
  const DesignerElement = FormElements[type].designerComponent;

  const draggable = useDraggable({
    id: `designer-btn-${type}`,
    data: {
      type,
      isDesignerBtnElement: true,
    },
  });

  return (
    <div
      ref={draggable.setNodeRef}
      {...draggable.listeners}
      {...draggable.attributes}
      className="border rounded-lg p-4 bg-background hover:bg-primary/5 hover:border-primary cursor-grab active:cursor-grabbing transition-all"
    >
      <DesignerElement elementInstance={{ id: "temp", type }} />
    </div>
  );
}
export function DesignerSidebar() {
  return (
    <aside className="w-80 h-full border-l bg-card p-6 overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Элементы формы</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Перетащите элемент в рабочую область
      </p>
      <Separator className="mb-6" />

      <div className="grid grid-cols-1 gap-3">
        {elements.map((el) => (
          <SidebarBtnElement key={el.type} type={el.type} />
        ))}
      </div>
    </aside>
  );
}