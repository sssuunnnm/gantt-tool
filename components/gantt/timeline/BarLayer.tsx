"use client";

import type { Row } from "@/lib/tree";
import type { TimelineState } from "@/lib/timeline";
import { LAYOUT } from "@/lib/constants";
import TaskBar from "./TaskBar";

interface Props {
  rows: Row[];
  timeline: TimelineState;
  projectId: string;
}

export default function BarLayer({ rows, timeline, projectId }: Props) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {rows.map((row, i) => {
        if (!row.task.startDate || !row.task.endDate) return null;
        return (
          <TaskBar
            key={row.id}
            task={row.task}
            rowIndex={i}
            timeline={timeline}
            projectId={projectId}
          />
        );
      })}
    </div>
  );
}
