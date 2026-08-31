import { SkillCategory } from "@prisma/client";
import { z } from "zod";

export const CreateSkillMasterSchema = z.object({
  category: z.enum([
    SkillCategory.LANGUAGE,
    SkillCategory.FRAMEWORK,
    SkillCategory.DATABASE,
    SkillCategory.CLOUD,
    SkillCategory.TOOL,
  ]),
  name: z.string().min(1, "スキル名は必須です"),
});

export const ToggleSkillMasterSchema = z.object({
  isActive: z.boolean(),
});

export type CreateSkillMasterFormInput = z.infer<typeof CreateSkillMasterSchema>;
