"use client";
import { useState } from "react";
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

interface DesignerLayoutProps {
  elements: FormElementInstance[];
  setElements: (els: FormElementInstance[]) => void;
  selectedElement: FormElementInstance | null;
  setSelectedElement: (el: FormElementInstance | null) => void;
}

export function DesignerLayout({
  elements,
  setElements,
  selectedElement,
  setSelectedElement
}: DesignerLayoutProps) {
  const [draggedElement, setDraggedElement] = useState<FormElementInstance | null>(null);
  const [isDraggingNew, setIsDraggingNew] = useState(false);
  
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

    // 1. УДАЛЕНИЕ (Корзина)
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

    // 2. ДОБАВЛЕНИЕ НОВОГО ЭЛЕМЕНТА
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

    // 3. ПЕРЕМЕЩЕНИЕ СУЩЕСТВУЮЩЕГО ЭЛЕМЕНТА
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
      <div className="flex-1 flex relative w-full overflow-hidden bg-background">
        
        {/* ХОЛСТ */}
        <div className="flex-1 p-4 sm:p-8 overflow-auto overflow-x-hidden bg-muted/10 relative h-full w-full">
          <div className="w-full max-w-4xl mx-auto min-h-[calc(100vh-12rem)] pb-32">
            <SortableContext 
              items={elements.map((e) => e.id)} 
              strategy={verticalListSortingStrategy}
            >
              {elements.length === 0 ? (
                <EmptyDroppable />
              ) : (
                <div className="space-y-4">
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

        {/* САЙДБАР */}
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

        {/* КОРЗИНА */}
        <TrashZone isDragging={!!draggedElement} />
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