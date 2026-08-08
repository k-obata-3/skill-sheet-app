import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/require";
import { getSkillMasters } from "@/lib/skill/getSkillMasters";
import PageComponent from "@/components/layout/PageComponent";
import ProjectEditUI from "./ui";

export default async function ProjectEditPage({ params }: { params: { projectId: string } }) {
  const session = await requireSession();
  const masters = await getSkillMasters(session.companyId);
  const p = await params

  const project = await prisma.skillProject.findFirst({
    where: {
      id: p.projectId,
      companyId: session.companyId
    },
  });

  if (!project) {
    throw new Error("Not found");
  }

  return (
    <PageComponent title="案件編集">
      <ProjectEditUI
        masters={masters}
        initialProject={{
          id: project.id,
          name: project.name,
          periodFrom: project.periodFrom,
          periodTo: project.periodTo ?? "",
          projectJson: project.projectJson as any,
          skillsJson: project.skillsJson as any,
        }}
      />
    </PageComponent>
  );
}
