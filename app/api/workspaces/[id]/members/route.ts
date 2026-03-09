import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });

  const invitedUser = await prisma.user.findUnique({ where: { email } });
  if (!invitedUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const existing = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: params.id, userId: invitedUser.id } },
  });
  if (existing) return NextResponse.json({ error: "Already a member" }, { status: 409 });

  const member = await prisma.workspaceMember.create({
    data: { workspaceId: params.id, userId: invitedUser.id, role: "member" },
    include: { user: true },
  });

  return NextResponse.json(member, { status: 201 });
}
