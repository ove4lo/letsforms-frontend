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
  rectIntersection,
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
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { FormStatus } from "@/components/StatusSelector";

interface DesignerLayoutProps {
  elements: FormElementInstance[];
  setElements: (els: FormElementInstance[]) => void;
  selectedElement: FormElementInstance | null;
  setSelectedElement: (el: FormElementInstance | null) => void;
  // Пропсы для хедера
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
  // Пропсы для хедера
  title,
  description,
  status,
  isSaving,
  hasQuestions,
  hasDraft,
  onTitleChange,
  onDescriptionChange,
  onSave,
  onStatusChange
}: DesignerLayoutProps) {
  const [draggedElement, setDraggedElement] = useState<FormElementInstance | null>(null);
  const [isDraggingNew, setIsDraggingNew] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile && selectedElement) {
      setSidebarOpen(false);
      setPropertiesOpen(true);
    }
  }, [selectedElement, isMobile]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    console.log("Drag start:", active.id);

    if (active.data.current?.isDesignerBtnElement) {
      const type = active.data.current.type;
      const newElement = createNewElement(type);
      setDraggedElement(newElement);
      setIsDraggingNew(true);
    } else {
      const id = active.id as string;
      const existing = elements.find((el) => el.id === id);
      setDraggedElement(existing || null);
      setIsDraggingNew(false);
    }
  };

  const handleDragOver = (event: any) => {
    console.log("Drag over:", event.over?.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    console.log("Drag ended:", {
      activeId: active.id,
      overId: over?.id,
    });

    if (over && over.id === "trash-zone") {
      console.log("🗑️ Удаляем элемент в корзину:", active.id);

      const newElements = elements.filter((el) => el.id !== active.id);
      setElements(newElements);

      if (selectedElement?.id === active.id) {
        setSelectedElement(null);
      }

      setDraggedElement(null);
      setIsDraggingNew(false);
      return;
    }

    setDraggedElement(null);
    setIsDraggingNew(false);

    if (!over) return;

    if (isDraggingNew && draggedElement) {
      let newIndex: number = elements.length;

      if (over.id === "empty-droppable") {
        newIndex = 0;
      }
      else if (over.data.current?.isDesignerElement) {
        const overIdStr = String(over.id);
        const realElementId = overIdStr.replace(/^top-/, '').replace(/^bottom-/, '');
        const overIndex = elements.findIndex((el) => el.id === realElementId);

        if (overIndex !== -1) {
          const isTopHalf = over.data.current.isTopHalf;
          newIndex = isTopHalf ? overIndex : overIndex + 1;
        }
      }

      const newElements = [...elements];
      newElements.splice(newIndex, 0, draggedElement);
      setElements(newElements);
      setSelectedElement(draggedElement);
      return;
    }

    if (!isDraggingNew) {
      const activeId = active.id as string;
      const overIdStr = String(over.id);

      if (activeId === overIdStr) return;

      const realOverId = overIdStr.replace(/^top-/, '').replace(/^bottom-/, '');
      const activeIndex = elements.findIndex((el) => el.id === activeId);
      const overIndex = elements.findIndex((el) => el.id === realOverId);

      if (activeIndex !== -1 && overIndex !== -1) {
        const isTopHalf = over.data.current?.isTopHalf;
        let newIndex: number = isTopHalf ? overIndex : overIndex + 1;

        if (activeIndex < overIndex && !isTopHalf) newIndex -= 1;
        if (activeIndex > overIndex && isTopHalf) newIndex += 1;

        const newElements = arrayMove(elements, activeIndex, newIndex);
        setElements(newElements);
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
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden bg-background">

        {/* ХЕДЕР - всегда сверху */}
        <BuilderHeader
          title={title}
          description={description}
          status={status}
          isSaving={isSaving}
          hasQuestions={hasQuestions}
          hasDraft={hasDraft}
          elements={elements}
          onTitleChange={onTitleChange}
          onDescriptionChange={onDescriptionChange}
          onSave={onSave}
          onStatusChange={onStatusChange}
        />

        {/* ОСНОВНАЯ РАБОЧАЯ ОБЛАСТЬ */}
        <div className="flex-1 flex relative w-full overflow-hidden">

          {/* Мобильные кнопки*/}
          {isMobile && (
            <div className="absolute bottom-6 right-4 z-50 flex flex-col gap-3">
              {/* Кнопка добавления элементов */}
              <Button
                size="icon"
                className="h-12 w-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
                onClick={() => setSidebarOpen(true)}
              >
                <Plus className="h-5 w-5" />
              </Button>

              {/* Кнопка свойств (только если выбран элемент) */}
              {selectedElement && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-12 w-12 rounded-full shadow-lg"
                  onClick={() => setPropertiesOpen(true)}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              )}
            </div>
          )}

          {/* МОБИЛЬНЫЙ САЙДБАР (элементы) */}
          {isMobile && (
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetContent side="right" className="w-[260px] p-0">
                <VisuallyHidden>
                  <SheetTitle>Панель элементов</SheetTitle>
                </VisuallyHidden>
                <DesignerSidebar
                  onAddElement={(newElement) => {
                    setElements([...elements, newElement]);
                    setSelectedElement(newElement);
                    setSidebarOpen(false);
                  }}
                />
              </SheetContent>
            </Sheet>
          )}

          {/* МОБИЛЬНАЯ ПАНЕЛЬ СВОЙСТВ */}
          {isMobile && (
            <Sheet open={propertiesOpen} onOpenChange={setPropertiesOpen}>
              <SheetContent side="right" className="w-[260px] p-0">
                <VisuallyHidden>
                  <SheetTitle>Панель свойств</SheetTitle>
                </VisuallyHidden>
                {selectedElement && (
                  <PropertiesPanel
                    element={selectedElement}
                    updateElement={updateElement}
                    closePanel={() => {
                      setPropertiesOpen(false);
                      setSelectedElement(null);
                    }}
                  />
                )}
              </SheetContent>
            </Sheet>
          )}

          {/* ХОЛСТ */}
          <div className={cn(
            "flex-1 p-4 overflow-auto overflow-x-hidden bg-muted/10 relative h-full w-full",
            isMobile && "pb-24"
          )}>
            <div className="w-full max-w-4xl mx-auto min-h-[calc(100vh-12rem)] pb-16">
              <SortableContext
                items={elements.map((e) => e.id)}
                strategy={verticalListSortingStrategy}
              >
                {elements.length === 0 ? (
                  <EmptyDroppable />
                ) : (
                  <div className="space-y-3">
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

          {/* ДЕСКТОПНЫЙ САЙДБАР */}
          {!isMobile && (
            <div className="flex-shrink-0 h-full border-l bg-card transition-all duration-300 z-10">
              {selectedElement ? (
                <PropertiesPanel
                  element={selectedElement}
                  updateElement={updateElement}
                  closePanel={() => setSelectedElement(null)}
                />
              ) : (
                <DesignerSidebar />
              )}
            </div>
          )}

          {/* КОРЗИНА */}
          <TrashZone isDragging={!!draggedElement} />
        </div>
      </div>

      <DragOverlay>
        {draggedElement && (
          <div className="opacity-80 rotate-2 scale-105 shadow-2xl pointer-events-none origin-center">
            {FormElements[draggedElement.type].designerComponent({ elementInstance: draggedElement })}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}