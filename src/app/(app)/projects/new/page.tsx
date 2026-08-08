import { requireSession } from "@/lib/auth/require";
import { getSkillMasters } from "@/lib/skill/getSkillMasters";
import PageComponent from "@/components/layout/PageComponent";
import ProjectEditUI from "../[projectId]/ui";

export default async function ProjectNewPage() {
  const session = await requireSession();
  const masters = await getSkillMasters(session.companyId);

  return (
    <PageComponent title="案件登録">
      <ProjectEditUI
        masters={masters}
        initialProject={{
          name: "",
          periodFrom: "",
          periodTo: "",
          projectJson: {
            description: "",
            role: "",
            phases: [],
          },
          skillsJson: {
            languages: [],
            frameworks: [],
            databases: [],
            cloud: [],
            tools: [],
          },
        }}
      />
    </PageComponent>
  );
}
