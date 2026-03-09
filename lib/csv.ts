import type { Task } from "./tree";

export interface CsvRow {
  title: string;
  parent?: string;
  start_date?: string;
  end_date?: string;
  assignee?: string;
  status?: string;
}

export interface CsvImportResult {
  tasks: Omit<Task, "id" | "createdAt" | "updatedAt" | "assignees" | "children">[];
  assigneeEmails: { titlePath: string; email: string }[];
  errors: string[];
}

/** CSV text → task import data */
export function parseCsvToTasks(
  csvText: string,
  projectId: string
): CsvImportResult {
  const errors: string[] = [];
  const assigneeEmails: { titlePath: string; email: string }[] = [];

  // 헤더 파싱
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) {
    return { tasks: [], assigneeEmails: [], errors: ["CSV가 비어있습니다."] };
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const titleIdx = headers.indexOf("title");

  if (titleIdx === -1) {
    return { tasks: [], assigneeEmails: [], errors: ["title 컬럼이 필요합니다."] };
  }

  const parentIdx = headers.indexOf("parent");
  const startIdx = headers.indexOf("start_date");
  const endIdx = headers.indexOf("end_date");
  const assigneeIdx = headers.indexOf("assignee");
  const statusIdx = headers.indexOf("status");

  // title → temp id 맵
  const titleToId = new Map<string, string>();
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    if (!cols[titleIdx]) continue;

    const row: CsvRow = {
      title: cols[titleIdx],
      parent: parentIdx !== -1 ? cols[parentIdx] : undefined,
      start_date: startIdx !== -1 ? cols[startIdx] : undefined,
      end_date: endIdx !== -1 ? cols[endIdx] : undefined,
      assignee: assigneeIdx !== -1 ? cols[assigneeIdx] : undefined,
      status: statusIdx !== -1 ? cols[statusIdx] : undefined,
    };

    rows.push(row);
    titleToId.set(row.title, `temp-${i}`);
  }

  // tasks 생성
  const tasks: CsvImportResult["tasks"] = rows.map((row, i) => {
    const parentId = row.parent && titleToId.has(row.parent)
      ? titleToId.get(row.parent)!
      : null;

    // 날짜 유효성 검사
    let startDate = null;
    let endDate = null;

    if (row.start_date) {
      const d = new Date(row.start_date);
      if (isNaN(d.getTime())) {
        errors.push(`Row ${i + 2}: 잘못된 start_date 형식 (${row.start_date})`);
      } else {
        startDate = d;
      }
    }

    if (row.end_date) {
      const d = new Date(row.end_date);
      if (isNaN(d.getTime())) {
        errors.push(`Row ${i + 2}: 잘못된 end_date 형식 (${row.end_date})`);
      } else {
        endDate = d;
      }
    }

    if (row.assignee) {
      assigneeEmails.push({ titlePath: row.title, email: row.assignee });
    }

    return {
      id: titleToId.get(row.title)!,
      projectId,
      parentId,
      title: row.title,
      description: null,
      startDate,
      endDate,
      orderIndex: i * 1000,
      status: row.status || "todo",
    };
  });

  // temp id를 실제 순서 기반 index로 변환 (서버에서 실제 uuid 생성)
  return { tasks, assigneeEmails, errors };
}

/** CSV 템플릿 생성 */
export function generateCsvTemplate(): string {
  const header = "title,parent,start_date,end_date,assignee,status";
  const example1 = "개발,,2026-03-01,2026-03-31,,todo";
  const example2 = "프런트엔드,개발,2026-03-01,2026-03-15,user@example.com,in_progress";
  const example3 = "버튼 UI,프런트엔드,2026-03-01,2026-03-05,,todo";
  const example4 = "백엔드,개발,2026-03-10,2026-03-31,,todo";

  return [header, example1, example2, example3, example4].join("\n");
}
