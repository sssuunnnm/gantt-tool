import { useMemo } from "react";
import { useUIStore } from "@/store/uiStore";
import {
  generateMonths,
  generateDays,
  getTimelineWidth,
  type TimelineState,
} from "@/lib/timeline";

export function useTimeline() {
  const dayWidth = useUIStore((s) => s.dayWidth);
  const timelineStart = useUIStore((s) => s.timelineStart);
  const timelineEnd = useUIStore((s) => s.timelineEnd);

  const timeline: TimelineState = useMemo(
    () => ({ startDate: timelineStart, endDate: timelineEnd, dayWidth }),
    [timelineStart, timelineEnd, dayWidth]
  );

  const months = useMemo(() => generateMonths(timeline), [timeline]);
  const days = useMemo(() => generateDays(timeline), [timeline]);
  const totalWidth = useMemo(() => getTimelineWidth(timeline), [timeline]);

  return { timeline, months, days, totalWidth };
}
