import { SkillCategory } from "@prisma/client";

export const SKILL_CATEGORY_LABEL: Record<SkillCategory, string> = {
  LANGUAGE: "言語",
  FRAMEWORK: "フレームワーク",
  DATABASE: "データベース",
  CLOUD: "クラウド・インフラ",
  TOOL: "ツール",
};

export const SKILL_CATEGORY_ORDER: SkillCategory[] = [
  SkillCategory.LANGUAGE,
  SkillCategory.FRAMEWORK,
  SkillCategory.DATABASE,
  SkillCategory.CLOUD,
  SkillCategory.TOOL,
];
