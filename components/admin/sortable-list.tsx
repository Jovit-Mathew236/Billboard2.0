"use client";

import { ReactNode, useState } from "react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableListProps<T extends { id: string }> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, handle: ReactNode, index: number) => ReactNode;
  layout?: "list" | "grid";
  className?: string;
}

export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  layout = "list",
  className,
}: SortableListProps<T>) {
  const [ordered, setOrdered] = useState(items);
  const [source, setSource] = useState(items);
  if (source !== items) {
    setSource(items);
    setOrdered(items);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = ordered.findIndex((i) => i.id === active.id);
    const to = ordered.findIndex((i) => i.id === over.id);
    const next = arrayMove(ordered, from, to);
    setOrdered(next);
    onReorder(next);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ordered.map((i) => i.id)} strategy={layout === "grid" ? rectSortingStrategy : verticalListSortingStrategy}>
        <div className={className}>
          {ordered.map((item, index) => (
            <SortableItem key={item.id} id={item.id}>
              {(handle) => renderItem(item, handle, index)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({ id, children }: { id: string; children: (handle: ReactNode) => ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });

  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label="Drag to reorder"
      className="rounded-inner flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing"
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("relative min-w-0", isDragging && "z-10 opacity-80 [&>*]:shadow-lg [&>*]:ring-2 [&>*]:ring-primary")}
    >
      {children(handle)}
    </div>
  );
}
