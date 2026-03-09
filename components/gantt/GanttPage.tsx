"use client";

import { useRef } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useRows } from "@/hooks/useRows";
import { useTimeline } from "@/hooks/useTimeline";
import { LAYOUT } from "@/lib/constants";
import Toolbar from "./Toolbar";
import GanttHeader from "./GanttHeader";
import GanttBody from "./GanttBody";

interface User { id: string; name: string | null; email: string; image: string | null }
interface Project { id: string; name: string; workspaceId: string }

interface Props {
  project: Project;
  workspaceId: string;
  members: User[];
  currentUserId: string;
}

export default function GanttPage({ project, workspaceId, members, currentUserId }: Props) {
  const { data: tasks = [], isLoading } = useTasks(project.id);
  const rows = useRows(tasks);
  const { timeline, months, days, totalWidth } = useTimeline();

  // 좌우 스크롤 동기화용 ref
  const timelineHeaderRef = useRef<HTMLDivElement>(null);
  const timelineBodyRef = useRef<HTMLDivElement>(null);

  const onTimelineScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    if (timelineHeaderRef.current) timelineHeaderRef.current.scrollLeft = scrollLeft;
  };

  const onHeaderScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    if (timelineBodyRef.current) timelineBodyRef.current.scrollLeft = scrollLeft;
  };

  return (
    <div
      className="flex flex-col bg-white"
      style={{ height: "100vh" }}
    >
      <Toolbar
        project={project}
        workspaceId={workspaceId}
        projectId={project.id}
        members={members}
      />

      <GanttHeader
        months={months}
        days={days}
        totalWidth={totalWidth}
        timeline={timeline}
        headerRef={timelineHeaderRef}
        onScroll={onHeaderScroll}
      />

      <GanttBody
        rows={rows}
        tasks={tasks}
        timeline={timeline}
        totalWidth={totalWidth}
        projectId={project.id}
        members={members}
        currentUserId={currentUserId}
        timelineRef={timelineBodyRef}
        onTimelineScroll={onTimelineScroll}
        isLoading={isLoading}
      />
    </div>
  );
}
