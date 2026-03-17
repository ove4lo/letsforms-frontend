"use client";

import { FormElements } from "./elements/FormElements";
import { Separator } from "@/components/ui/separator";
import { useDraggable } from "@dnd-kit/core";
import { FormElementInstance, ElementsType } from "./types";

const layoutElements: ElementsType[] = ["ParagraphField"];
const formElements: ElementsType[] = [
  "TextField", "TextareaField", "NumberField", "DateField",
  "SelectField", "CheckboxField", "RadioField", "ScaleField",
];

const getDefaultAttributes = (type: ElementsType): Record<string, any> => {
  switch (type) {
    case "TextField": case "TextareaField":
      return { label: "Новое текстовое поле", required: false, placeholder: "Введите текст..." };
    case "NumberField":
      return { label: "Числовое поле", required: false, placeholder: "0" };
    case "DateField":
      return { label: "Выберите дату", required: false };
    case "CheckboxField": case "RadioField": case "SelectField":
      return { label: "Выберите вариант", required: false, options: ["Вариант 1", "Вариант 2", "Вариант 3"] };
    case "ScaleField":
      return { label: "Оцените от 1 до 10", required: false, min: 1, max: 10 };
    case "ParagraphField":
      return { text: "Информационный блок." };
    case "TitleField": return { text: "Заголовок" };
    case "SubTitleField": return { text: "Подзаголовок" };
    default: return {};
  }
};

function SidebarBtnElement({ type }: { type: ElementsType }) {
  const DesignerElement = FormElements[type].designerComponent;
  
  // Создаем превью с дефолтными данными
  const previewInstance: FormElementInstance = {
    id: `preview-${type}`,
    type,
    extraAttributes: getDefaultAttributes(type),
  };

  const { setNodeRef, listeners, attributes, transform, isDragging } = useDraggable({
    id: `sidebar-${type}`,
    data: {
      type,
      isDesignerBtnElement: true,
      defaultAttributes: getDefaultAttributes(type),
    },
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        relative border rounded-lg p-4 bg-background 
        hover:bg-muted/50 hover:border-primary/50 
        cursor-grab active:cursor-grabbing 
        transition-all duration-200 shadow-sm hover:shadow-md
        group select-none touch-none
        ${isDragging ? 'ring-2 ring-primary ring-offset-2 z-50' : ''}
      `}
    >
      <DesignerElement elementInstance={previewInstance} />
      
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-lg pointer-events-none transition-colors" />
    </div>
  );
}

export function DesignerSidebar() {
  return (
    <aside className="w-80 h-full border-l bg-card flex-shrink-0 flex flex-col overflow-hidden z-10">
      <div className="p-6 border-b flex-shrink-0">
        <h2 className="text-xl font-bold tracking-tight">Элементы</h2>
        <p className="text-sm text-muted-foreground mt-1">Перетащите в рабочую область</p>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Оформление</p>
          <div className="grid grid-cols-1 gap-3">{layoutElements.map((t) => <SidebarBtnElement key={t} type={t} />)}</div>
        </div>
        <Separator />
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Поля формы</p>
          <div className="grid grid-cols-1 gap-3">{formElements.map((t) => <SidebarBtnElement key={t} type={t} />)}</div>
        </div>
      </div>
    </aside>
  );
}