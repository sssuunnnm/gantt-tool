import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  // 첫 번째 workspace로 redirect, 없으면 생성
  let workspace = await prisma.workspace.findFirst({
    where: { members: { some: { userId: session.user.id } } },
    orderBy: { createdAt: "asc" },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: `${session.user.name ?? "My"}'s Workspace`,
        type: "personal",
        ownerId: session.user.id,
        members: {
          create: { userId: session.user.id, role: "owner" },
        },
      },
    });
  }

  redirect(`/workspace/${workspace.id}`);
}
