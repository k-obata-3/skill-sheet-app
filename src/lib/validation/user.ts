import { Role } from "@prisma/client";
import { z } from "zod";

const MonthString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 形式で入力してください");

export const UserSchema = z.object({
  email: z.string().email("メールアドレスの形式が不正です").optional(),
  name: z.string().min(1, "名前は必須です"),
  subName: z.string().nullable(),
  role: z.enum([Role.OWNER, Role.ADMIN, Role.MEMBER]),
  dateOfBirth: z.string().nullable().or(MonthString),
  isActive: z.boolean(),
});

export const InviteUserSchema = z.object({
  email: z.string().email("メールアドレスの形式が不正です"),
  name: z.string().min(1, "名前は必須です"),
  role: z.enum([Role.OWNER, Role.ADMIN, Role.MEMBER]),
});

export type UserFormInput = z.infer<typeof UserSchema>;
export type InviteUserFormInput = z.infer<typeof InviteUserSchema>;
