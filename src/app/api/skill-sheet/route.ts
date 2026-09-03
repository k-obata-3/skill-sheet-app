import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/require";
import { NextResponse } from "next/server";
import { z } from "zod";

const SUMMARY_MAX_LENGTH = 500;
const REMARKS_MAX_LENGTH = 300;

const SummarySchema = z.object({
  summary: z.string().min(1).max(SUMMARY_MAX_LENGTH, `自己PRは${SUMMARY_MAX_LENGTH}文字以内で入力してください`),
  remarks: z.string().max(REMARKS_MAX_LENGTH, `備考は${REMARKS_MAX_LENGTH}文字以内で入力してください`).optional(),
});

export async function PUT(req: Request) {
  const s = await requireSession();
  const body = await req.json();

  const parsed = SummarySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "バリデーションエラー" },
      { status: 400 }
    );
  }

  // ① 既存チェック
  const existing = await prisma.skillSheet.findFirst({
    where: {
      userId: s.userId,
      companyId: s.companyId,
    },
  });

  // ② update or create
  if (existing) {
    await prisma.skillSheet.update({
      where: { id: existing.id },
      data: {
        summary: parsed.data.summary,
        remarks: parsed.data.remarks,
      },
    });
  } else {
    // ここで外部キーが保証される
    await prisma.skillSheet.create({
      data: {
        userId: s.userId,
        companyId: s.companyId,
        summary: parsed.data.summary,
        remarks: parsed.data.remarks,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
