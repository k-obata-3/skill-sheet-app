import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/require";
import ProjectListUI from "./ui";
import PageComponent from "@/components/layout/PageComponent";

export default async function MySkillSheetPage() {
  const session = await requireSession();

  const sheet = await prisma.skillSheet.findFirst({
    where: {
      userId: session.userId,
      companyId: session.companyId
    },
    include: {
      projects: {
        orderBy: [
          { periodFrom: "desc" },
          { createdAt: "desc" },
        ],
      },
    },
  });

  return (
    <PageComponent title="スキルシート">
      <ProjectListUI sheet={sheet} />
    </PageComponent>
  );
}
