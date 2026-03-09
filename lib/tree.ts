export interface Task {
  id: string;
  projectId: string;
  parentId: string | null;
  title: string;
  description?: string | null;
  startDate: Date | string | null;
  endDate: Date | string | null;
  orderIndex: number;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  assignees?: TaskAssigneeWithUser[];
  children?: Task[];
}

export interface TaskAssigneeWithUser {
  id: string;
  taskId: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface Row {
  id: string;
  task: Task;
  depth: number;
  expanded: boolean;
  hasChildren: boolean;
}

/** flat tasks → tree 구조 */
export function buildTaskTree(tasks: Task[]): Task[] {
  const map = new Map<string, Task>();
  const roots: Task[] = [];

  // 1. map 구성
  tasks.forEach((t) => {
    map.set(t.id, { ...t, children: [] });
  });

  // 2. parent-child 연결
  tasks.forEach((t) => {
    const node = map.get(t.id)!;
    if (t.parentId && map.has(t.parentId)) {
      const parent = map.get(t.parentId)!;
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // 3. orderIndex 정렬
  const sortByOrder = (nodes: Task[]) => {
    nodes.sort((a, b) => a.orderIndex - b.orderIndex);
    nodes.forEach((n) => n.children && sortByOrder(n.children));
  };
  sortByOrder(roots);

  return roots;
}

/** tree → flat rows (expand/collapse 적용) */
export function buildRows(
  tree: Task[],
  expandedIds: Set<string>,
  depth = 0
): Row[] {
  const rows: Row[] = [];

  for (const task of tree) {
    const hasChildren = !!(task.children && task.children.length > 0);
    const expanded = expandedIds.has(task.id);

    rows.push({
      id: task.id,
      task,
      depth,
      expanded,
      hasChildren,
    });

    if (hasChildren && expanded) {
      rows.push(...buildRows(task.children!, expandedIds, depth + 1));
    }
  }

  return rows;
}

/** 특정 task의 모든 하위 id 수집 */
export function collectDescendantIds(task: Task): string[] {
  const ids: string[] = [];
  const traverse = (t: Task) => {
    if (t.children) {
      t.children.forEach((c) => {
        ids.push(c.id);
        traverse(c);
      });
    }
  };
  traverse(task);
  return ids;
}

/** orderIndex 재계산 (reorder 후) */
export function reorderTasks(
  tasks: Task[],
  activeId: string,
  overId: string
): { id: string; orderIndex: number }[] {
  const siblings = tasks
    .filter((t) => {
      const active = tasks.find((x) => x.id === activeId);
      return t.parentId === active?.parentId && t.projectId === active?.projectId;
    })
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const from = siblings.findIndex((t) => t.id === activeId);
  const to = siblings.findIndex((t) => t.id === overId);

  if (from === -1 || to === -1) return [];

  const reordered = [...siblings];
  const [moved] = reordered.splice(from, 1);
  reordered.splice(to, 0, moved);

  return reordered.map((t, i) => ({ id: t.id, orderIndex: i * 1000 }));
}
