import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import WorkspacePage from "@/components/workspace/WorkspacePage";

export default async function Page({ params }: { params: { workspaceId: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const workspace = await prisma.workspace.findUnique({
    where: { id: params.workspaceId },
    include: {
      members: { include: { user: true } },
      projects: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!workspace) redirect("/");

  return <WorkspacePage workspace={workspace} userId={session.user.id} />;
}
