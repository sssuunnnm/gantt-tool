import { useMemo } from "react";
import { buildTaskTree, buildRows, type Task, type Row } from "@/lib/tree";
import { useUIStore } from "@/store/uiStore";

export function useRows(tasks: Task[]): Row[] {
  const expandedIds = useUIStore((s) => s.expandedIds);

  return useMemo(() => {
    const tree = buildTaskTree(tasks);
    return buildRows(tree, expandedIds);
  }, [tasks, expandedIds]);
}
