import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require";
import PageComponent from "@/components/layout/PageComponent";
import SkillMasterAdminUI from "./ui";

export default async function AdminSkillMasterPage() {
  const session = await requireAdmin();

  const skillMasters = await prisma.skillMaster.findMany({
    where: { companyId: session.companyId },
    orderBy: { name: "asc" },
    select: { id: true, category: true, name: true, isActive: true },
  });

  return (
    <PageComponent title="マスタ管理">
      <SkillMasterAdminUI skillMasters={skillMasters} />
    </PageComponent>
  );
}
