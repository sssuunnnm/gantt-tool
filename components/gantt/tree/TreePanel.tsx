"use client";

import type { Row } from "@/lib/tree";
import { LAYOUT } from "@/lib/constants";
import TreeRow from "./TreeRow";

interface User { id: string; name: string | null; email: string; image: string | null }

interface Props {
  rows: Row[];
  projectId: string;
  members: User[];
  currentUserId: string;
}

export default function TreePanel({ rows, projectId, members, currentUserId }: Props) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-sm">
        <p>태스크가 없습니다</p>
        <p className="text-xs mt-1">상단 툴바에서 추가하거나 CSV를 가져오세요</p>
      </div>
    );
  }

  return (
    <div>
      {rows.map((row) => (
        <TreeRow
          key={row.id}
          row={row}
          projectId={projectId}
          members={members}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
