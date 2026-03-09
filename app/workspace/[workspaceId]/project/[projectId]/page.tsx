import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import GanttPage from "@/components/gantt/GanttPage";

export default async function Page({
  params,
}: {
  params: { workspaceId: string; projectId: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
  });

  if (!project) redirect(`/workspace/${params.workspaceId}`);

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: params.workspaceId },
    include: { user: true },
  });

  return (
    <GanttPage
      project={project}
      workspaceId={params.workspaceId}
      members={members.map((m) => m.user)}
      currentUserId={session.user.id}
    />
  );
}
