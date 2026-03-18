"use client";

import { FormElements } from "./elements/FormElements";
import { Separator } from "@/components/ui/separator";
import { useDraggable } from "@dnd-kit/core";
import { FormElementInstance, ElementsType } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";

const layoutElements: ElementsType[] = ["ParagraphField"];
const formElements: ElementsType[] = [
  "TextField", "TextareaField", "NumberField", "DateField",
  "SelectField", "CheckboxField", "RadioField", "ScaleField",
];

const getDefaultAttributes = (type: ElementsType): Record<string, any> => {
  switch (type) {
    case "TextField": case "TextareaField":
      return { label: "Новое поле", required: false, placeholder: "Текст..." };
    case "NumberField":
      return { label: "Число", required: false, placeholder: "0" };
    case "DateField":
      return { label: "Дата", required: false };
    case "CheckboxField": case "RadioField": case "SelectField":
      return { label: "Выбор", required: false, options: ["Вар 1", "Вар 2", "Вар 3"] };
    case "ScaleField":
      return { label: "Оценка", required: false, min: 1, max: 10 };
    case "ParagraphField":
      return { text: "Инфоблок" };
    case "TitleField": return { text: "Заголовок" };
    case "SubTitleField": return { text: "Подзаголовок" };
    default: return {};
  }
};

function SidebarBtnElement({ type }: { type: ElementsType }) {
  const DesignerElement = FormElements[type].designerComponent;
  
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
        relative border rounded-md p-2 bg-background 
        hover:bg-muted/50 hover:border-primary/50 
        cursor-grab active:cursor-grabbing 
        transition-all duration-200 shadow-sm hover:shadow-md
        group select-none touch-none text-sm
        ${isDragging ? 'ring-1 ring-primary ring-offset-1 z-50' : ''}
      `}
    >
      <DesignerElement elementInstance={previewInstance} />
      
      <div className="absolute inset-0 border border-transparent group-hover:border-primary/20 rounded-md pointer-events-none transition-colors" />
    </div>
  );
}

export function DesignerSidebar() {
  return (
    <aside className="w-full h-full bg-card flex flex-col overflow-hidden">
      {/* Шапка */}
      <div className="sticky top-0 z-10 bg-card border-b">
        <div className="p-2.5">
          <h2 className="text-sm font-bold tracking-tight">Элементы</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Перетащите в область</p>
        </div>
      </div>

      {/* Содержимое */}
      <ScrollArea className="flex-1">
        <div className="p-2.5 space-y-2.5">
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Оформление</p>
            <div className="grid grid-cols-1 gap-1.5">
              {layoutElements.map((t) => <SidebarBtnElement key={t} type={t} />)}
            </div>
          </div>
          <Separator className="my-1" />
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Поля формы</p>
            <div className="grid grid-cols-1 gap-1.5">
              {formElements.map((t) => <SidebarBtnElement key={t} type={t} />)}
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}