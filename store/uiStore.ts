import { create } from "zustand";
import { TIMELINE } from "@/lib/constants";
import { getDefaultTimelineRange } from "@/lib/timeline";

interface UIState {
  // Tree
  expandedIds: Set<string>;
  selectedTaskId: string | null;

  // Timeline
  dayWidth: number;
  timelineStart: Date;
  timelineEnd: Date;

  // Actions
  toggleExpand: (id: string) => void;
  expandAll: (ids: string[]) => void;
  collapseAll: () => void;
  setSelectedTask: (id: string | null) => void;
  setDayWidth: (width: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setTimelineRange: (start: Date, end: Date) => void;
}

export const useUIStore = create<UIState>((set, get) => {
  const { startDate, endDate } = getDefaultTimelineRange();

  return {
    expandedIds: new Set(),
    selectedTaskId: null,
    dayWidth: TIMELINE.DAY_WIDTH_DEFAULT,
    timelineStart: startDate,
    timelineEnd: endDate,

    toggleExpand: (id) =>
      set((state) => {
        const next = new Set(state.expandedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return { expandedIds: next };
      }),

    expandAll: (ids) =>
      set({ expandedIds: new Set(ids) }),

    collapseAll: () =>
      set({ expandedIds: new Set() }),

    setSelectedTask: (id) =>
      set({ selectedTaskId: id }),

    setDayWidth: (width) =>
      set({ dayWidth: width }),

    zoomIn: () => {
      const { dayWidth } = get();
      const levels = TIMELINE.ZOOM_LEVELS;
      const idx = levels.indexOf(dayWidth as (typeof levels)[number]);
      if (idx < levels.length - 1) set({ dayWidth: levels[idx + 1] });
    },

    zoomOut: () => {
      const { dayWidth } = get();
      const levels = TIMELINE.ZOOM_LEVELS;
      const idx = levels.indexOf(dayWidth as (typeof levels)[number]);
      if (idx > 0) set({ dayWidth: levels[idx - 1] });
    },

    setTimelineRange: (start, end) =>
      set({ timelineStart: start, timelineEnd: end }),
  };
});
