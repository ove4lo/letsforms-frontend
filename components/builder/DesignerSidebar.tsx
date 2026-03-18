"use client";

import { FormElements } from "./elements/FormElements";
import { Separator } from "@/components/ui/separator";
import { useDraggable } from "@dnd-kit/core";
import { FormElementInstance, ElementsType } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { createNewElement } from "./utils";

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

interface SidebarBtnElementProps {
  type: ElementsType;
  onClick?: (element: FormElementInstance) => void;
  isMobile?: boolean;
}

function SidebarBtnElement({ type, onClick, isMobile }: SidebarBtnElementProps) {
  const DesignerElement = FormElements[type].designerComponent;
  
  const previewInstance: FormElementInstance = {
    id: `preview-${type}`,
    type,
    extraAttributes: getDefaultAttributes(type),
  };

  // На мобильных не используем draggable
  const { setNodeRef, listeners, attributes, transform, isDragging } = !isMobile ? useDraggable({
    id: `sidebar-${type}`,
    data: {
      type,
      isDesignerBtnElement: true,
      defaultAttributes: getDefaultAttributes(type),
    },
  }) : { setNodeRef: undefined, listeners: undefined, attributes: undefined, transform: undefined, isDragging: false };

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : {};

  const handleClick = () => {
    if (isMobile && onClick) {
      const newElement = createNewElement(type);
      onClick(newElement);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(!isMobile ? { ...listeners, ...attributes } : {})}
      onClick={handleClick}
      className={`
        relative border rounded-md p-2 bg-background 
        hover:bg-muted/50 hover:border-primary/50 
        transition-all duration-200 shadow-sm hover:shadow-md
        group select-none touch-none text-sm
        ${!isMobile ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
        ${isDragging ? 'ring-1 ring-primary ring-offset-1 z-50' : ''}
      `}
    >
      <DesignerElement elementInstance={previewInstance} />
      
      <div className="absolute inset-0 border border-transparent group-hover:border-primary/20 rounded-md pointer-events-none transition-colors" />
    </div>
  );
}

interface DesignerSidebarProps {
  onAddElement?: (element: FormElementInstance) => void;
}

export function DesignerSidebar({ onAddElement }: DesignerSidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Предотвращаем гидратацию
  if (!mounted) {
    return null;
  }

  return (
    <aside className="
      w-full sm:w-64 md:w-72 lg:w-80
      h-full bg-card flex flex-col overflow-hidden
      border-r border-border/50
    ">
      {/* Шапка */}
      <div className="sticky top-0 z-10 bg-card border-b">
        <div className="p-3">
          <h2 className="text-sm font-semibold tracking-tight">Элементы</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isMobile ? "Нажмите чтобы добавить" : "Перетащите в область"}
          </p>
        </div>
      </div>

      {/* Содержимое */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
              Оформление
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {layoutElements.map((t) => (
                <SidebarBtnElement 
                  key={t} 
                  type={t} 
                  onClick={onAddElement}
                  isMobile={isMobile}
                />
              ))}
            </div>
          </div>
          
          <Separator className="my-2" />
          
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
              Поля формы
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {formElements.map((t) => (
                <SidebarBtnElement 
                  key={t} 
                  type={t} 
                  onClick={onAddElement}
                  isMobile={isMobile}
                />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}