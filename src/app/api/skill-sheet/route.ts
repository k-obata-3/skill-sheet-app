import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/require";
import { NextResponse } from "next/server";
import { z } from "zod";

const SummarySchema = z.object({
  summary: z.string().min(1),
  remarks: z.string().optional(),
});

export async function PUT(req: Request) {
  const s = await requireSession();
  const body = await req.json();

  const parsed = SummarySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "validation error" },
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
