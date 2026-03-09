"use client";

import { useState, useRef } from "react";
import { ChevronRight, ChevronDown, Plus, Trash2, GripVertical } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useCreateTask, useDeleteTask, useUpdateTask } from "@/hooks/useTasks";
import { LAYOUT } from "@/lib/constants";
import type { Row } from "@/lib/tree";
import { cn } from "@/lib/utils";

interface User { id: string; name: string | null; email: string; image: string | null }

interface Props {
  row: Row;
  projectId: string;
  members: User[];
  currentUserId: string;
}

const STATUS_COLORS: Record<string, string> = {
  todo: "bg-slate-200",
  in_progress: "bg-blue-400",
  done: "bg-green-400",
};

const STATUS_LABELS: Record<string, string> = {
  todo: "할 일",
  in_progress: "진행 중",
  done: "완료",
};

export default function TreeRow({ row, projectId, members, currentUserId }: Props) {
  const { task, depth, expanded, hasChildren } = row;
  const toggleExpand = useUIStore((s) => s.toggleExpand);
  const selectedTaskId = useUIStore((s) => s.selectedTaskId);
  const setSelectedTask = useUIStore((s) => s.setSelectedTask);

  const createTask = useCreateTask(projectId);
  const deleteTask = useDeleteTask(projectId);
  const updateTask = useUpdateTask(projectId);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const isSelected = selectedTaskId === task.id;

  const handleTitleSubmit = () => {
    setEditing(false);
    if (title.trim() && title !== task.title) {
      updateTask.mutate({ id: task.id, title: title.trim() });
    } else {
      setTitle(task.title);
    }
  };

  const addSubtask = (e: React.MouseEvent) => {
    e.stopPropagation();
    createTask.mutate({ title: "새 서브태스크", projectId, parentId: task.id });
    if (!expanded) toggleExpand(task.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`"${task.title}" 태스크를 삭제할까요? 하위 태스크도 모두 삭제됩니다.`)) {
      deleteTask.mutate(task.id);
    }
  };

  const assignee = task.assignees?.[0];

  return (
    <div
      className={cn(
        "group flex items-center border-b border-slate-100 cursor-pointer transition-colors",
        isSelected ? "bg-slate-50" : "hover:bg-slate-50/50"
      )}
      style={{ height: LAYOUT.ROW_HEIGHT, paddingLeft: depth * LAYOUT.INDENT_SIZE + 8 }}
      onClick={() => setSelectedTask(isSelected ? null : task.id)}
    >
      {/* Drag handle */}
      <div className="w-4 flex-shrink-0 opacity-0 group-hover:opacity-100 cursor-grab text-slate-300">
        <GripVertical size={13} />
      </div>

      {/* Expand toggle */}
      <div
        className="w-5 h-5 flex items-center justify-center flex-shrink-0"
        onClick={(e) => { e.stopPropagation(); if (hasChildren) toggleExpand(task.id); }}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown size={13} className="text-slate-400" />
          ) : (
            <ChevronRight size={13} className="text-slate-400" />
          )
        ) : null}
      </div>

      {/* Status dot */}
      <div className={cn("w-2 h-2 rounded-full flex-shrink-0 mr-2", STATUS_COLORS[task.status] ?? "bg-slate-200")} />

      {/* Title */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleTitleSubmit();
              if (e.key === "Escape") { setTitle(task.title); setEditing(false); }
            }}
            autoFocus
            className="w-full text-sm outline-none bg-transparent"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className="text-sm text-slate-800 truncate block"
            onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
          >
            {task.title}
          </span>
        )}
      </div>

      {/* Assignee */}
      {assignee && (
        <div className="flex-shrink-0 ml-1">
          {assignee.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={assignee.user.image} alt="" className="w-5 h-5 rounded-full" title={assignee.user.name ?? assignee.user.email} />
          ) : (
            <div className="w-5 h-5 rounded-full bg-slate-300 flex items-center justify-center text-xs text-slate-600 font-bold">
              {(assignee.user.name ?? assignee.user.email)[0].toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 flex-shrink-0">
        <button
          onClick={addSubtask}
          className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded"
          title="서브태스크 추가"
        >
          <Plus size={12} />
        </button>
        <button
          onClick={handleDelete}
          className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-red-500 rounded"
          title="삭제"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
