import { TIMELINE } from "./constants";

export interface TimelineState {
  startDate: Date;
  endDate: Date;
  dayWidth: number;
}

export interface BarPosition {
  left: number;
  width: number;
}

export interface MonthHeader {
  label: string;
  date: Date;
  left: number;
  width: number;
}

export interface DayHeader {
  date: Date;
  label: string;
  left: number;
  isWeekend: boolean;
}

export interface VisibleRange {
  startDay: number;
  endDay: number;
}

/** 날짜 → 픽셀 x 좌표 */
export function dateToX(date: Date, timeline: TimelineState): number {
  const days = (date.getTime() - timeline.startDate.getTime()) / (1000 * 60 * 60 * 24);
  return days * timeline.dayWidth;
}

/** task bar의 left, width 계산 */
export function getBarPosition(
  startDate: Date | null,
  endDate: Date | null,
  timeline: TimelineState
): BarPosition | null {
  if (!startDate || !endDate) return null;

  const daysFromStart =
    (startDate.getTime() - timeline.startDate.getTime()) / (1000 * 60 * 60 * 24);
  const duration =
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

  return {
    left: daysFromStart * timeline.dayWidth,
    width: Math.max(duration * timeline.dayWidth, timeline.dayWidth), // 최소 1일
  };
}

/** 전체 timeline width */
export function getTimelineWidth(timeline: TimelineState): number {
  const days =
    (timeline.endDate.getTime() - timeline.startDate.getTime()) / (1000 * 60 * 60 * 24);
  return days * timeline.dayWidth;
}

/** month header 생성 */
export function generateMonths(timeline: TimelineState): MonthHeader[] {
  const months: MonthHeader[] = [];
  const current = new Date(timeline.startDate);
  current.setDate(1);

  while (current <= timeline.endDate) {
    const monthStart = new Date(current);
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    const visibleStart = monthStart < timeline.startDate ? timeline.startDate : monthStart;
    const visibleEnd = monthEnd > timeline.endDate ? timeline.endDate : monthEnd;

    months.push({
      label: current.toLocaleString("default", { month: "short", year: "numeric" }),
      date: new Date(current),
      left: dateToX(visibleStart, timeline),
      width:
        ((visibleEnd.getTime() - visibleStart.getTime()) / (1000 * 60 * 60 * 24) + 1) *
        timeline.dayWidth,
    });

    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

/** day header 생성 */
export function generateDays(timeline: TimelineState): DayHeader[] {
  const days: DayHeader[] = [];
  const current = new Date(timeline.startDate);

  while (current <= timeline.endDate) {
    const dayOfWeek = current.getDay();
    days.push({
      date: new Date(current),
      label: String(current.getDate()),
      left: dateToX(current, timeline),
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
    current.setDate(current.getDate() + 1);
  }

  return days;
}

/** scroll 기반 visible range 계산 (virtualization) */
export function getVisibleRange(
  scrollLeft: number,
  viewportWidth: number,
  dayWidth: number
): VisibleRange {
  const startDay = Math.floor(scrollLeft / dayWidth);
  const endDay = Math.ceil((scrollLeft + viewportWidth) / dayWidth);
  return { startDay, endDay };
}

/** deltaX → days 이동 계산 (drag) */
export function deltaToDays(deltaX: number, dayWidth: number): number {
  return Math.round(deltaX / dayWidth);
}

/** 날짜에 days 추가 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** 기본 timeline range 생성 (오늘 기준 ±45일) */
export function getDefaultTimelineRange(): { startDate: Date; endDate: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = addDays(today, -15);
  const endDate = addDays(today, TIMELINE.DEFAULT_RANGE_DAYS);

  return { startDate, endDate };
}
