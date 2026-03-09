"use client";

import { LAYOUT } from "@/lib/constants";
import type { MonthHeader, DayHeader, TimelineState } from "@/lib/timeline";
import { cn } from "@/lib/utils";

interface Props {
  months: MonthHeader[];
  days: DayHeader[];
  totalWidth: number;
  timeline: TimelineState;
  headerRef: React.RefObject<HTMLDivElement>;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

export default function GanttHeader({ months, days, totalWidth, headerRef, onScroll }: Props) {
  return (
    <div
      className="flex flex-shrink-0 border-b border-slate-200 bg-white"
      style={{ height: LAYOUT.HEADER_HEIGHT }}
    >
      {/* Tree header */}
      <div
        className="flex-shrink-0 flex flex-col justify-end border-r border-slate-200 bg-slate-50"
        style={{ width: LAYOUT.TREE_WIDTH }}
      >
        <div className="px-4 pb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Task</span>
        </div>
      </div>

      {/* Timeline header */}
      <div
        ref={headerRef}
        className="flex-1 overflow-hidden"
        onScroll={onScroll}
      >
        <div className="relative" style={{ width: totalWidth, height: LAYOUT.HEADER_HEIGHT }}>
          {/* Month row */}
          <div className="absolute top-0 left-0 right-0 flex" style={{ height: LAYOUT.HEADER_HEIGHT / 2 }}>
            {months.map((m, i) => (
              <div
                key={i}
                className="absolute flex items-center px-2 border-r border-slate-200"
                style={{
                  left: m.left,
                  width: m.width,
                  height: LAYOUT.HEADER_HEIGHT / 2,
                  top: 0,
                }}
              >
                <span className="text-xs font-semibold text-slate-600 truncate">{m.label}</span>
              </div>
            ))}
          </div>

          {/* Day row */}
          <div
            className="absolute left-0 right-0 flex"
            style={{ top: LAYOUT.HEADER_HEIGHT / 2, height: LAYOUT.HEADER_HEIGHT / 2 }}
          >
            {days.map((d, i) => (
              <div
                key={i}
                className={cn(
                  "absolute flex items-center justify-center border-r border-slate-100",
                  d.isWeekend ? "bg-slate-50" : ""
                )}
                style={{
                  left: d.left,
                  width: days[1] ? days[1].left - days[0].left : 40,
                  height: LAYOUT.HEADER_HEIGHT / 2,
                }}
              >
                <span
                  className={cn(
                    "text-xs",
                    d.isWeekend ? "text-slate-400" : "text-slate-500"
                  )}
                >
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
