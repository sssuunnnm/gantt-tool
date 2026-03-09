"use client";

import { useCallback } from "react";
import { LAYOUT } from "@/lib/constants";
import type { Task } from "@/lib/tree";
import type { TimelineState } from "@/lib/timeline";
import { getBarPosition, addDays, deltaToDays } from "@/lib/timeline";
import { useUpdateTask } from "@/hooks/useTasks";
import { useInteractionStore } from "@/store/interactionStore";
import { cn } from "@/lib/utils";

interface Props {
  task: Task;
  rowIndex: number;
  timeline: TimelineState;
  projectId: string;
}

const STATUS_COLORS: Record<string, string> = {
  todo: "bg-indigo-500",
  in_progress: "bg-blue-500",
  done: "bg-green-500",
};

export default function TaskBar({ task, rowIndex, timeline, projectId }: Props) {
  const updateTask = useUpdateTask(projectId);
  const { draggingTaskId, startDrag, endDrag } = useInteractionStore();

  const start = task.startDate ? new Date(task.startDate) : null;
  const end = task.endDate ? new Date(task.endDate) : null;
  const pos = getBarPosition(start, end, timeline);
  if (!pos) return null;

  const isDragging = draggingTaskId === task.id;

  const handleDragMove = useCallback(
    (e: React.MouseEvent, type: "move" | "resize-left" | "resize-right") => {
      e.stopPropagation();
      e.preventDefault();

      const startX = e.clientX;
      startDrag(task.id, type, startX, start, end);

      const onMove = (me: MouseEvent) => {
        const deltaX = me.clientX - startX;
        const days = deltaToDays(deltaX, timeline.dayWidth);
        if (days === 0) return;

        let newStart = start!;
        let newEnd = end!;

        if (type === "move") {
          newStart = addDays(start!, days);
          newEnd = addDays(end!, days);
        } else if (type === "resize-right") {
          newEnd = addDays(end!, days);
          if (newEnd <= newStart) return;
        } else if (type === "resize-left") {
          newStart = addDays(start!, days);
          if (newStart >= newEnd) return;
        }

        updateTask.mutate({
          id: task.id,
          startDate: newStart.toISOString(),
          endDate: newEnd.toISOString(),
        });
      };

      const onUp = () => {
        endDrag();
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [task, start, end, timeline, updateTask, startDrag, endDrag]
  );

  return (
    <div
      className={cn(
        "absolute flex items-center rounded pointer-events-auto select-none transition-opacity",
        STATUS_COLORS[task.status] ?? "bg-indigo-500",
        isDragging ? "opacity-80 shadow-lg" : "opacity-90 hover:opacity-100"
      )}
      style={{
        left: pos.left,
        width: pos.width,
        top: rowIndex * LAYOUT.ROW_HEIGHT + (LAYOUT.ROW_HEIGHT - 24) / 2,
        height: 24,
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: isDragging ? 20 : 10,
      }}
      onMouseDown={(e) => handleDragMove(e, "move")}
    >
      {/* Resize left */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/10 rounded-l"
        onMouseDown={(e) => { e.stopPropagation(); handleDragMove(e, "resize-left"); }}
      />

      {/* Label */}
      <span className="text-xs text-white font-medium px-2 truncate pointer-events-none select-none">
        {task.title}
      </span>

      {/* Resize right */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/10 rounded-r"
        onMouseDown={(e) => { e.stopPropagation(); handleDragMove(e, "resize-right"); }}
      />
    </div>
  );
}
