import { prisma } from "@/lib/prisma";
import { SkillCategory } from "@prisma/client";

export async function getSkillMasters(companyId: string) {
  const all = await prisma.skillMaster.findMany({
    where: {
      companyId: companyId,
      isActive: true
    },
    orderBy: {
      name: "asc"
    },
  });

  const by = (cat: SkillCategory) =>
    all.filter((s) => s.category === cat).map((s) => s.name);

  return {
    languages: by(SkillCategory.LANGUAGE),
    frameworks: by(SkillCategory.FRAMEWORK),
    databases: by(SkillCategory.DATABASE),
    cloud: by(SkillCategory.CLOUD),
    tools: by(SkillCategory.TOOL),
  };
}

export type SkillMasters = Awaited<ReturnType<typeof getSkillMasters>>;
