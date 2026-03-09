"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users, FolderOpen, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface Project { id: string; name: string; createdAt: Date | string }
interface User { id: string; name: string | null; email: string; image: string | null }
interface Member { id: string; userId: string; role: string; user: User }
interface Workspace {
  id: string; name: string; type: string;
  members: Member[];
  projects: Project[];
}

export default function WorkspacePage({
  workspace,
  userId,
}: {
  workspace: Workspace;
  userId: string;
}) {
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createProject = async () => {
    if (!projectName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName, workspaceId: workspace.id }),
      });
      const project = await res.json();
      router.push(`/workspace/${workspace.id}/project/${project.id}`);
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async () => {
    if (!inviteEmail.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "초대 실패");
      } else {
        setInviteEmail("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <FolderOpen size={14} className="text-white" />
          </div>
          <span className="font-semibold text-slate-900">{workspace.name}</span>
        </div>
        <button
          onClick={() => signOut()}
          className="text-slate-500 hover:text-slate-700 flex items-center gap-1.5 text-sm"
        >
          <LogOut size={15} />
          로그아웃
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Projects */}
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Projects
          </h2>
          <div className="space-y-2 mb-4">
            {workspace.projects.length === 0 && (
              <p className="text-slate-400 text-sm py-4 text-center border border-dashed border-slate-200 rounded-xl">
                프로젝트가 없습니다
              </p>
            )}
            {workspace.projects.map((p) => (
              <button
                key={p.id}
                onClick={() => router.push(`/workspace/${workspace.id}/project/${p.id}`)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-brand-500 hover:shadow-sm transition-all text-left"
              >
                <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
                  <FolderOpen size={15} className="text-brand-600" />
                </div>
                <span className="font-medium text-slate-800">{p.name}</span>
              </button>
            ))}
          </div>

          {/* Create project */}
          <div className="flex gap-2">
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createProject()}
              placeholder="프로젝트 이름"
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500"
            />
            <button
              onClick={createProject}
              disabled={loading || !projectName.trim()}
              className="px-3 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 disabled:opacity-50 flex items-center gap-1"
            >
              <Plus size={15} />
              생성
            </button>
          </div>
        </section>

        {/* Members */}
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Members
          </h2>
          <div className="space-y-2 mb-4">
            {workspace.members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl">
                {m.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.user.image} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                    {(m.user.name ?? m.user.email)[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{m.user.name ?? m.user.email}</p>
                  <p className="text-xs text-slate-400">{m.role}</p>
                </div>
                {m.userId === userId && (
                  <span className="text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">나</span>
                )}
              </div>
            ))}
          </div>

          {/* Invite */}
          {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
          <div className="flex gap-2">
            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && inviteMember()}
              placeholder="이메일로 초대"
              type="email"
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500"
            />
            <button
              onClick={inviteMember}
              disabled={loading || !inviteEmail.trim()}
              className="px-3 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-900 disabled:opacity-50 flex items-center gap-1"
            >
              <Users size={15} />
              초대
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
