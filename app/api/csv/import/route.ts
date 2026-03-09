import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseCsvToTasks } from "@/lib/csv";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { csvText, projectId } = await req.json();
  if (!csvText || !projectId) return NextResponse.json({ error: "csvText, projectId required" }, { status: 400 });

  const { tasks, assigneeEmails, errors } = parseCsvToTasks(csvText, projectId);

  if (tasks.length === 0) {
    return NextResponse.json({ error: "No valid tasks", details: errors }, { status: 400 });
  }

  // temp id → real id 매핑
  const tempToReal = new Map<string, string>();

  // 부모 없는 task 먼저 생성
  const roots = tasks.filter((t) => !t.parentId || !t.parentId.startsWith("temp-"));
  const children = tasks.filter((t) => t.parentId && t.parentId.startsWith("temp-"));

  for (const task of roots) {
    const created = await prisma.task.create({
      data: {
        projectId: task.projectId,
        parentId: null,
        title: task.title,
        startDate: task.startDate,
        endDate: task.endDate,
        orderIndex: task.orderIndex,
        status: task.status,
      },
    });
    tempToReal.set(task.id, created.id);
  }

  // 자식 task 생성 (depth 순서 보장)
  let remaining = [...children];
  let maxIterations = 10;

  while (remaining.length > 0 && maxIterations-- > 0) {
    const nextRemaining: typeof remaining = [];

    for (const task of remaining) {
      const realParentId = tempToReal.get(task.parentId!);
      if (!realParentId) {
        nextRemaining.push(task);
        continue;
      }

      const created = await prisma.task.create({
        data: {
          projectId: task.projectId,
          parentId: realParentId,
          title: task.title,
          startDate: task.startDate,
          endDate: task.endDate,
          orderIndex: task.orderIndex,
          status: task.status,
        },
      });
      tempToReal.set(task.id, created.id);
    }

    remaining = nextRemaining;
  }

  // assignee 처리
  for (const { titlePath, email } of assigneeEmails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) continue;

    const taskEntry = tasks.find((t) => t.title === titlePath);
    if (!taskEntry) continue;

    const realTaskId = tempToReal.get(taskEntry.id);
    if (!realTaskId) continue;

    await prisma.taskAssignee.upsert({
      where: { taskId_userId: { taskId: realTaskId, userId: user.id } },
      create: { taskId: realTaskId, userId: user.id },
      update: {},
    });
  }

  return NextResponse.json({
    success: true,
    created: tempToReal.size,
    warnings: errors,
  });
}
