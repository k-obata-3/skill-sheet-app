import { z } from "zod";

const MonthString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 形式で入力してください");

export const ProjectJsonSchema = z.object({
  description: z.string(),
  role: z.string().min(1, "役割は必須です"),
  phases: z.array(z.string()).nonempty("担当工程は必須です"),
});

export const ProjectSkillsSchema = z.object({
  languages: z.array(z.string()),
  frameworks: z.array(z.string()),
  databases: z.array(z.string()),
  cloud: z.array(z.string()),
  tools: z.array(z.string()),
});

export const ProjectFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "案件名は必須です"),
  periodFrom: z.string().min(1, "開始日は必須です").and(MonthString),
  periodTo: MonthString.optional().or(z.literal("")),
  projectJson: ProjectJsonSchema,
  skillsJson: ProjectSkillsSchema,
});

export type ProjectFormInput = z.infer<typeof ProjectFormSchema>;
