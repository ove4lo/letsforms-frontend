"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DesignerSidebar } from "./DesignerSidebar";
import { DesignerElementWrapper } from "./DesignerElementWrapper";
import { PropertiesPanel } from "./PropertiesPanel";
import { TrashZone } from "./TrashZone";
import { EmptyDroppable } from "./EmptyDroppable";
import { FormElements } from "./elements/FormElements";
import { FormElementInstance } from "./types";
import { createNewElement } from "./utils";
import { BuilderHeader } from "./BuilderHeader";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { FormStatus } from "@/components/StatusSelector";
import { cn } from "@/lib/utils";
import { FloatingActions } from "./FloatingActions";

function DragOverlayContent({ element }: { element: FormElementInstance }) {
  const Component = FormElements[element.type].designerComponent;
  return <Component elementInstance={element} />;
}

interface DesignerLayoutProps {
  elements: FormElementInstance[];
  setElements: (els: FormElementInstance[]) => void;
  selectedElement: FormElementInstance | null;
  setSelectedElement: (el: FormElementInstance | null) => void;
  title: string;
  description: string;
  status: FormStatus;
  isSaving: boolean;
  hasQuestions: boolean;
  hasDraft?: boolean;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSave: () => void;
  onStatusChange: (s: FormStatus) => void;
}

export function DesignerLayout({
  elements,
  setElements,
  selectedElement,
  setSelectedElement,
  title,
  description,
  status,
  isSaving,
  hasQuestions,
  hasDraft,
  onTitleChange,
  onDescriptionChange,
  onSave,
  onStatusChange,
}: DesignerLayoutProps) {
  const [draggedElement, setDraggedElement] = useState<FormElementInstance | null>(null);
  const [isDraggingNew, setIsDraggingNew] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile && selectedElement) {
      setSidebarOpen(false);
      setPropertiesOpen(true);
    }
  }, [selectedElement, isMobile]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.isDesignerBtnElement) {
      const type = active.data.current.type;
      const newElement = createNewElement(type);
      setDraggedElement(newElement);
      setIsDraggingNew(true);
    } else {
      const existing = elements.find((el) => el.id === active.id);
      setDraggedElement(existing || null);
      setIsDraggingNew(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // 1. Удаление в корзину
    if (over && over.id === "trash-zone") {
      const newElements = elements.filter((el) => el.id !== active.id);
      setElements(newElements);
      if (selectedElement?.id === active.id) setSelectedElement(null);
      setDraggedElement(null);
      setIsDraggingNew(false);
      return;
    }

    setDraggedElement(null);
    setIsDraggingNew(false);

    if (!over) return;

    // 2. Добавление нового элемента из сайдбара
    if (isDraggingNew && draggedElement) {
      const overId = over.id as string;

      // Если бросили на пустое место
      if (overId === "empty-droppable") {
        setElements([draggedElement]);
        setSelectedElement(draggedElement);
        return;
      }

      // Если бросили на существующий элемент (вставляем ПЕРЕД ним)
      const overIndex = elements.findIndex((el) => el.id === overId);
      if (overIndex !== -1) {
        const newElements = [...elements];
        newElements.splice(overIndex, 0, draggedElement);
        setElements(newElements);
        setSelectedElement(draggedElement);
      }
      return;
    }

    // 3. Перемещение существующего элемента (SORTABLE)
    if (!isDraggingNew) {
      const activeId = active.id as string;
      const overId = over.id as string;

      if (activeId !== overId) {
        const oldIndex = elements.findIndex((el) => el.id === activeId);
        const newIndex = elements.findIndex((el) => el.id === overId);

        if (oldIndex !== -1 && newIndex !== -1) {
          // Массив перемещается автоматически правильно благодаря closestCenter
          setElements(arrayMove(elements, oldIndex, newIndex));
        }
      }
    }
  };

  const updateElement = (updated: FormElementInstance) => {
    const newElements = elements.map((el) => (el.id === updated.id ? updated : el));
    setElements(newElements);
    setSelectedElement(updated);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter} // КЛЮЧЕВОЙ МОМЕНТ
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden bg-background">
        <BuilderHeader
          title={title} description={description} status={status} isSaving={isSaving}
          hasQuestions={hasQuestions} hasDraft={hasDraft} elements={elements}
          onTitleChange={onTitleChange} onDescriptionChange={onDescriptionChange}
          onSave={onSave} onStatusChange={onStatusChange}
        />

        <div className="flex-1 flex relative w-full overflow-hidden">
          {/* Мобильные панели */}
          {isMobile && (
            <>
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="right" className="w-[260px] p-0">
                  <VisuallyHidden><SheetTitle>Элементы</SheetTitle></VisuallyHidden>
                  <DesignerSidebar
                    onAddElement={(newElement) => {
                      setElements([...elements, newElement]);
                      setSelectedElement(newElement);
                      setSidebarOpen(false);
                    }}
                  />
                </SheetContent>
              </Sheet>

              <Sheet open={propertiesOpen} onOpenChange={setPropertiesOpen}>
                <SheetContent side="right" className="w-[260px] p-0">
                  <VisuallyHidden><SheetTitle>Свойства</SheetTitle></VisuallyHidden>
                  {selectedElement && (
                    <PropertiesPanel
                      element={selectedElement}
                      updateElement={updateElement}
                      closePanel={() => { setPropertiesOpen(false); setSelectedElement(null); }}
                    />
                  )}
                </SheetContent>
              </Sheet>
            </>
          )}

          {/* Холст */}
          <div className={cn("flex-1 p-4 overflow-auto overflow-x-hidden bg-muted/10 relative h-full w-full", isMobile && "pb-24")}>
            <div className="w-full max-w-4xl mx-auto min-h-[calc(100vh-12rem)] pb-16">
              <SortableContext items={elements.map((e) => e.id)} strategy={verticalListSortingStrategy}>
                {elements.length === 0 ? (
                  <EmptyDroppable />
                ) : (
                  <div className="space-y-2">
                    {elements.map((el) => (
                      <DesignerElementWrapper
                        key={el.id}
                        element={el}
                        isSelected={selectedElement?.id === el.id}
                        onSelect={() => setSelectedElement(el)}
                        onRemove={(id) => {
                          const newEls = elements.filter((e) => e.id !== id);
                          setElements(newEls);
                          if (selectedElement?.id === id) setSelectedElement(null);
                        }}
                      />
                    ))}
                  </div>
                )}
              </SortableContext>
            </div>
          </div>

          {/* Десктопный сайдбар */}
          {!isMobile && (
            <div className="flex-shrink-0 h-full border-l bg-card transition-all duration-300 z-10">
              {selectedElement ? (
                <PropertiesPanel element={selectedElement} updateElement={updateElement} closePanel={() => setSelectedElement(null)} />
              ) : (
                <DesignerSidebar />
              )}
            </div>
          )}

          <TrashZone isDragging={!!draggedElement} />
          <FloatingActions onAddClick={() => setSidebarOpen(true)} />
        </div>
      </div>

      <DragOverlay>
        {draggedElement && (
          <div className="opacity-80 rotate-2 scale-105 shadow-2xl pointer-events-none origin-center">
            <DragOverlayContent element={draggedElement} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}