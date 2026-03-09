import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { updates } = await req.json() as {
    updates: { id: string; orderIndex: number; parentId?: string | null }[];
  };

  if (!updates?.length) return NextResponse.json({ error: "updates required" }, { status: 400 });

  await prisma.$transaction(
    updates.map(({ id, orderIndex, parentId }) =>
      prisma.task.update({
        where: { id },
        data: {
          orderIndex,
          ...(parentId !== undefined && { parentId }),
        },
      })
    )
  );

  return NextResponse.json({ success: true });
}
