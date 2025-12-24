"use client";

import { FormElements } from "./elements/FormElements";
import { Separator } from "@/components/ui/separator";
import { useDraggable } from "@dnd-kit/core";

type ElementType = keyof typeof FormElements;  

const layoutElements = [
  // { type: "TitleField" as const, label: "Заголовок" },
  // { type: "SubTitleField" as const, label: "Подзаголовок" },
  { type: "ParagraphField" as const, label: "Текст" },
  // { type: "SeparatorField" as const, label: "Разделитель" },
  // { type: "SpacerField" as const, label: "Отступ" },
];

const formElements = [
  { type: "TextField" as const, label: "Текст" },
  { type: "TextareaField" as const, label: "Текстовая область" },
  { type: "NumberField" as const, label: "Число" },
  { type: "DateField" as const, label: "Дата" },
  { type: "SelectField" as const, label: "Выпадающий список" },
  { type: "CheckboxField" as const, label: "Чекбоксы" },
  { type: "RadioField" as const, label: "Радиокнопки" },
  { type: "ScaleField" as const, label: "Шкала 1-10" },
];

function SidebarBtnElement({ type }: { type: ElementType }) {
  const DesignerElement = FormElements[type].designerComponent;

  const draggable = useDraggable({
    id: `sidebar-${type}`,
    data: { type, isDesignerBtnElement: true },
  });

  return (
    <div
      ref={draggable.setNodeRef}
      {...draggable.listeners}
      {...draggable.attributes}
      className="border rounded-lg p-4 bg-background hover:bg-muted/50 cursor-grab active:cursor-grabbing transition"
    >
      <DesignerElement elementInstance={{ id: "temp", type }} />
    </div>
  );
}

export function DesignerSidebar() {
  return (
    <aside className="w-80 h-full border-l bg-card p-6 overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Элементы</h2>

      <p className="text-sm text-muted-foreground mb-2">Оформление</p>
      <div className="grid grid-cols-1 gap-3 mb-6">
        {layoutElements.map((el) => (
          <SidebarBtnElement key={el.type} type={el.type} />
        ))}
      </div>

      <Separator className="my-6" />

      <p className="text-sm text-muted-foreground mb-2">Поля формы</p>
      <div className="grid grid-cols-1 gap-3">
        {formElements.map((el) => (
          <SidebarBtnElement key={el.type} type={el.type} />
        ))}
      </div>
    </aside>
  );
}