import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Task } from "@/lib/tree";

const TASKS_KEY = (projectId: string) => ["tasks", projectId];

async function fetchTasks(projectId: string): Promise<Task[]> {
  const res = await fetch(`/api/tasks?projectId=${projectId}`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: TASKS_KEY(projectId),
    queryFn: () => fetchTasks(projectId),
    enabled: !!projectId,
  });
}

export function useCreateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Task> & { title: string }) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, projectId }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY(projectId) }),
  });
}

export function useUpdateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Task> & { id: string }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY(projectId) }),
  });
}

export function useDeleteTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY(projectId) }),
  });
}

export function useReorderTasks(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: { id: string; orderIndex: number; parentId?: string | null }[]) => {
      const res = await fetch("/api/tasks/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      if (!res.ok) throw new Error("Failed to reorder tasks");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY(projectId) }),
  });
}

export function useAddAssignee(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, userId }: { taskId: string; userId: string }) => {
      const res = await fetch(`/api/tasks/${taskId}/assignees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to add assignee");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY(projectId) }),
  });
}

export function useRemoveAssignee(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, userId }: { taskId: string; userId: string }) => {
      const res = await fetch(`/api/tasks/${taskId}/assignees?userId=${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove assignee");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY(projectId) }),
  });
}
