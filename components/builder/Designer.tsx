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
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { DesignerSidebar } from "./DesignerSidebar";
import { DesignerElementWrapper } from "./DesignerElementWrapper";
import { FormElements } from "./elements/FormElements";
import { FormElementInstance } from "./types";
import { nanoid } from "nanoid";

export function Designer({ initialElements = [] }: { initialElements: FormElementInstance[] }) {
  const [elements, setElements] = useState<FormElementInstance[]>(initialElements);
  const [draggedType, setDraggedType] = useState<keyof typeof FormElements | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.isDesignerBtnElement) {
      setDraggedType(event.active.data.current.type);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const isDesignerBtn = active.data.current?.isDesignerBtnElement;
    const isDroppingOverDesignerArea = over.data.current?.isDesignerDropArea;
    const isDroppingOverDesignerElementTopHalf = over.data.current?.isTopHalfDesignerElement;
    const isDroppingOverDesignerElementBottomHalf = over.data.current?.isBottomHalfDesignerElement;
    const isDroppingOverDesignerElement = isDroppingOverDesignerElementTopHalf || isDroppingOverDesignerElementBottomHalf;

    // Добавление нового элемента
    if (isDesignerBtn) {
      const type = active.data.current?.type as keyof typeof FormElements;
      const newElement: FormElementInstance = {
        id: nanoid(),
        type,
      };

      if (isDroppingOverDesignerArea) {
        setElements((prev) => [...prev, newElement]);
        return;
      }

      if (isDroppingOverDesignerElement) {
        const overId = over.data.current?.elementId;
        const overIndex = elements.findIndex((el) => el.id === overId);
        if (overIndex !== -1) {
          const newIndex = isDroppingOverDesignerElementTopHalf ? overIndex : overIndex + 1;
          setElements((prev) => {
            const newElements = [...prev];
            newElements.splice(newIndex, 0, newElement);
            return newElements;
          });
        }
        return;
      }
    }

    // Перемещение существующих
    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeIndex = elements.findIndex((el) => el.id === activeId);
    const overIndex = elements.findIndex((el) => el.id === overId);

    if (activeIndex !== -1 && overIndex !== -1) {
      let newIndex = overIndex;
      if (isDroppingOverDesignerElementBottomHalf) {
        newIndex = overIndex + 1;
      }

      setElements((prev) => arrayMove(prev, activeIndex, newIndex));
    }

    setDraggedType(null);
  };

  const removeElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex w-full h-full">
        {/* Рабочая зона */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="w-full">
            <div
              data-is-designer-drop-area="true"
              className="min-h-screen rounded-xl bg-background/50 p-12 border-2 border-dashed border-muted-foreground/20"
            >
              {elements.length === 0 ? (
                <div className="h-96 flex items-center justify-center text-center">
                  <p className="text-xl text-muted-foreground">
                    Перетащите элементы из правой панели
                  </p>
                </div>
              ) : (
                <SortableContext items={elements.map((e) => e.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-6">
                    {elements.map((element) => (
                      <DesignerElementWrapper
                        key={element.id}
                        element={element}
                        onRemove={removeElement}
                      />
                    ))}
                  </div>
                </SortableContext>
              )}
            </div>
          </div>
        </div>

        <DesignerSidebar />
      </div>

      <DragOverlay>
        {draggedType && (
          <div className="opacity-80 pointer-events-none">
            {FormElements[draggedType].designerComponent({
              elementInstance: { id: "ghost", type: draggedType },
            })}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}