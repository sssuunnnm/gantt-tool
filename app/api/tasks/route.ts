import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId is required" }, { status: 400 });

  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: {
      assignees: { include: { user: true } },
    },
    orderBy: { orderIndex: "asc" },
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, parentId, title, startDate, endDate, status } = await req.json();
  if (!projectId || !title) return NextResponse.json({ error: "projectId, title required" }, { status: 400 });

  // 같은 레벨 마지막 orderIndex 계산
  const lastTask = await prisma.task.findFirst({
    where: { projectId, parentId: parentId ?? null },
    orderBy: { orderIndex: "desc" },
  });
  const orderIndex = (lastTask?.orderIndex ?? 0) + 1000;

  const task = await prisma.task.create({
    data: {
      projectId,
      parentId: parentId ?? null,
      title,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      orderIndex,
      status: status ?? "todo",
    },
    include: { assignees: { include: { user: true } } },
  });

  return NextResponse.json(task, { status: 201 });
}
