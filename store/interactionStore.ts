import { create } from "zustand";

export type DragType = "move" | "resize-left" | "resize-right" | "create";

interface InteractionState {
  // Drag (timeline bar)
  draggingTaskId: string | null;
  dragType: DragType | null;
  dragStartX: number;
  dragStartDate: Date | null;
  dragEndDate: Date | null;

  // Drag create (빈 영역 드래그)
  isCreating: boolean;
  createStartDay: number | null;
  createEndDay: number | null;
  createRowId: string | null; // 어느 row에서 생성 중인지

  // Actions
  startDrag: (taskId: string, type: DragType, startX: number, startDate: Date | null, endDate: Date | null) => void;
  updateDrag: (currentX: number) => void;
  endDrag: () => void;

  startCreate: (rowId: string, startDay: number) => void;
  updateCreate: (endDay: number) => void;
  endCreate: () => void;
}

export const useInteractionStore = create<InteractionState>((set) => ({
  draggingTaskId: null,
  dragType: null,
  dragStartX: 0,
  dragStartDate: null,
  dragEndDate: null,

  isCreating: false,
  createStartDay: null,
  createEndDay: null,
  createRowId: null,

  startDrag: (taskId, type, startX, startDate, endDate) =>
    set({
      draggingTaskId: taskId,
      dragType: type,
      dragStartX: startX,
      dragStartDate: startDate,
      dragEndDate: endDate,
    }),

  updateDrag: (currentX) =>
    set((state) => ({ dragStartX: currentX })),

  endDrag: () =>
    set({
      draggingTaskId: null,
      dragType: null,
      dragStartX: 0,
      dragStartDate: null,
      dragEndDate: null,
    }),

  startCreate: (rowId, startDay) =>
    set({
      isCreating: true,
      createRowId: rowId,
      createStartDay: startDay,
      createEndDay: startDay,
    }),

  updateCreate: (endDay) =>
    set({ createEndDay: endDay }),

  endCreate: () =>
    set({
      isCreating: false,
      createStartDay: null,
      createEndDay: null,
      createRowId: null,
    }),
}));
