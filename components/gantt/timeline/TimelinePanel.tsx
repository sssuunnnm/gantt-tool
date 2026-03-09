"use client";

import { useRef, useCallback } from "react";
import { LAYOUT } from "@/lib/constants";
import type { Row, Task } from "@/lib/tree";
import type { TimelineState } from "@/lib/timeline";
import { addDays, deltaToDays } from "@/lib/timeline";
import { useUpdateTask, useCreateTask } from "@/hooks/useTasks";
import { useInteractionStore } from "@/store/interactionStore";
import { useUIStore } from "@/store/uiStore";
import BarLayer from "./BarLayer";
import { cn } from "@/lib/utils";

interface Props {
  rows: Row[];
  tasks: Task[];
  timeline: TimelineState;
  totalWidth: number;
  projectId: string;
}

export default function TimelinePanel({ rows, tasks, timeline, totalWidth, projectId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const updateTask = useUpdateTask(projectId);
  const createTask = useCreateTask(projectId);
  const interaction = useInteractionStore();

  const totalHeight = rows.length * LAYOUT.ROW_HEIGHT;

  // drag create: 빈 영역에서 마우스 다운
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, rowId: string) => {
      if (e.button !== 0) return;
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const startDay = Math.floor(x / timeline.dayWidth);
      interaction.startCreate(rowId, startDay);

      const onMove = (me: MouseEvent) => {
        const x2 = me.clientX - rect.left;
        const endDay = Math.floor(x2 / timeline.dayWidth);
        interaction.updateCreate(endDay);
      };

      const onUp = () => {
        const { createStartDay, createEndDay, createRowId } = useInteractionStore.getState();
        if (
          createRowId &&
          createStartDay !== null &&
          createEndDay !== null
        ) {
          const minDay = Math.min(createStartDay, createEndDay);
          const maxDay = Math.max(createStartDay, createEndDay) + 1;
          const startDate = addDays(timeline.startDate, minDay);
          const endDate = addDays(timeline.startDate, maxDay);
          createTask.mutate({
            title: "새 태스크",
            projectId,
            parentId: null,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          });
        }
        interaction.endCreate();
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [timeline, interaction, createTask, projectId]
  );

  return (
    <div
      ref={containerRef}
      className="relative no-select"
      style={{ width: totalWidth, minHeight: totalHeight }}
    >
      {/* Day grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(to right, #e2e8f0 1px, transparent 1px)",
          backgroundSize: `${timeline.dayWidth}px 100%`,
        }}
      />

      {/* Row backgrounds (hover targets for drag create) */}
      {rows.map((row, i) => (
        <div
          key={row.id}
          className="absolute w-full cursor-crosshair"
          style={{ top: i * LAYOUT.ROW_HEIGHT, height: LAYOUT.ROW_HEIGHT }}
          onMouseDown={(e) => handleMouseDown(e, row.id)}
        />
      ))}

      {/* Drag create preview */}
      {interaction.isCreating &&
        interaction.createStartDay !== null &&
        interaction.createEndDay !== null && (
          <div
            className="absolute bg-brand-200 border-2 border-brand-400 rounded pointer-events-none opacity-70"
            style={{
              left: Math.min(interaction.createStartDay, interaction.createEndDay) * timeline.dayWidth,
              width: (Math.abs(interaction.createEndDay - interaction.createStartDay) + 1) * timeline.dayWidth,
              top: rows.findIndex((r) => r.id === interaction.createRowId) * LAYOUT.ROW_HEIGHT + 6,
              height: LAYOUT.ROW_HEIGHT - 12,
            }}
          />
        )}

      {/* Task bars */}
      <BarLayer
        rows={rows}
        timeline={timeline}
        projectId={projectId}
      />
    </div>
  );
}
