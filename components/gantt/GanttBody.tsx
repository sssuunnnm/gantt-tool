"use client";

import { useRef, useCallback } from "react";
import { LAYOUT } from "@/lib/constants";
import type { Row, Task } from "@/lib/tree";
import type { TimelineState } from "@/lib/timeline";
import TreePanel from "./tree/TreePanel";
import TimelinePanel from "./timeline/TimelinePanel";

interface User { id: string; name: string | null; email: string; image: string | null }

interface Props {
  rows: Row[];
  tasks: Task[];
  timeline: TimelineState;
  totalWidth: number;
  projectId: string;
  members: User[];
  currentUserId: string;
  timelineRef: React.RefObject<HTMLDivElement>;
  onTimelineScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  isLoading: boolean;
}

export default function GanttBody({
  rows,
  tasks,
  timeline,
  totalWidth,
  projectId,
  members,
  currentUserId,
  timelineRef,
  onTimelineScroll,
  isLoading,
}: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
        불러오는 중...
      </div>
    );
  }

  return (
    <div
      ref={bodyRef}
      className="flex flex-1 overflow-y-auto overflow-x-hidden gantt-scrollbar"
    >
      {/* Tree Panel */}
      <div
        className="flex-shrink-0 border-r border-slate-200"
        style={{ width: LAYOUT.TREE_WIDTH }}
      >
        <TreePanel
          rows={rows}
          projectId={projectId}
          members={members}
          currentUserId={currentUserId}
        />
      </div>

      {/* Timeline Panel */}
      <div
        ref={timelineRef}
        className="flex-1 overflow-x-auto gantt-scrollbar"
        onScroll={onTimelineScroll}
      >
        <TimelinePanel
          rows={rows}
          tasks={tasks}
          timeline={timeline}
          totalWidth={totalWidth}
          projectId={projectId}
        />
      </div>
    </div>
  );
}
