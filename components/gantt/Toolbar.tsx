"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, ZoomIn, ZoomOut, Upload, ArrowLeft } from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useCreateTask } from "@/hooks/useTasks";
import { LAYOUT } from "@/lib/constants";
import { generateCsvTemplate } from "@/lib/csv";

interface User { id: string; name: string | null; email: string; image: string | null }
interface Project { id: string; name: string; workspaceId: string }

interface Props {
  project: Project;
  workspaceId: string;
  projectId: string;
  members: User[];
}

export default function Toolbar({ project, workspaceId, projectId, members }: Props) {
  const router = useRouter();
  const { zoomIn, zoomOut, dayWidth } = useUIStore();
  const createTask = useCreateTask(projectId);
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const { ZOOM_LEVELS } = { ZOOM_LEVELS: [24, 40, 64] };

  const addTask = () => {
    createTask.mutate({ title: "새 태스크", projectId });
  };

  const downloadTemplate = () => {
    const csv = generateCsvTemplate();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gantt-template.csv";
    a.click();
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const res = await fetch("/api/csv/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText: text, projectId }),
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
        window.location.reload();
      } else {
        alert("CSV 오류: " + (data.error ?? "알 수 없는 오류"));
      }
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  return (
    <div
      className="flex items-center justify-between px-4 border-b border-slate-200 bg-white flex-shrink-0"
      style={{ height: LAYOUT.TOOLBAR_HEIGHT }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push(`/workspace/${workspaceId}`)}
          className="text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-semibold text-slate-900 text-sm">{project.name}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Zoom */}
        <div className="flex items-center gap-1 border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={zoomOut}
            disabled={dayWidth === ZOOM_LEVELS[0]}
            className="px-2 py-1.5 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            <ZoomOut size={15} className="text-slate-600" />
          </button>
          <span className="text-xs text-slate-500 px-1 w-8 text-center">{dayWidth}px</span>
          <button
            onClick={zoomIn}
            disabled={dayWidth === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
            className="px-2 py-1.5 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            <ZoomIn size={15} className="text-slate-600" />
          </button>
        </div>

        {/* CSV */}
        <div className="flex items-center gap-1">
          <button
            onClick={downloadTemplate}
            className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            템플릿
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="px-3 py-1.5 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1 transition-colors"
          >
            <Upload size={13} />
            {importing ? "가져오는 중..." : "CSV 가져오기"}
          </button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
        </div>

        {/* Add task */}
        <button
          onClick={addTask}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-medium hover:bg-brand-700 transition-colors"
        >
          <Plus size={14} />
          태스크 추가
        </button>
      </div>
    </div>
  );
}
