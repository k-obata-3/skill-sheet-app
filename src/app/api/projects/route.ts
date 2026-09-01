import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/require";
import { NextResponse } from "next/server";
import { ProjectFormSchema } from "@/lib/validation/project";

export async function POST(req: Request) {
  const s = await requireSession();
  const body = await req.json();
  const parsed = ProjectFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "バリデーションエラー", errors: parsed.success ? null : parsed.error.flatten() },
      { status: 400 }
    );
  }

  const sheet =
    (await prisma.skillSheet.findFirst({
      where: {
        userId: s.userId,
        companyId: s.companyId,
      },
    })) ??
    (await prisma.skillSheet.create({
      data: {
        userId: s.userId,
        companyId: s.companyId,
      },
    }));

  // 案件作成
  const project = await prisma.skillProject.create({
    data: {
      skillSheetId: sheet.id,
      companyId: s.companyId,
      name: parsed.data.name,
      periodFrom: parsed.data.periodFrom,
      periodTo: parsed.data.periodTo,
      projectJson: parsed.data.projectJson,
      skillsJson: parsed.data.skillsJson,
    },
  });

  await prisma.skillSheet.update({
    where: {
      userId: s.userId,
      companyId: s.companyId,
    },
    data: {
      updatedAt: new Date()
    },
  })

  return NextResponse.json({ id: project.id });
}

export async function PUT(req: Request) {
  const s = await requireSession();
  const body = await req.json();

  const parsed = ProjectFormSchema.safeParse(body);
  if (!parsed.success || !parsed.data.id) {
    return NextResponse.json(
      { message: "バリデーションエラー", errors: parsed.success ? null : parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.skillProject.findFirst({
    where: {
      id: parsed.data.id,
      companyId: s.companyId,
      skillSheet: { userId: s.userId },
    },
    select: {
      id: true,
      skillSheetId: true,
    },
  });

  if (!existing) {
    return NextResponse.json({ message: "project not found" }, { status: 404 });
  }

  const data = parsed.data;
  await prisma.skillProject.updateMany({
    where: {
      id: data.id,
      companyId: s.companyId
    },
    data: {
      name: data.name,
      periodFrom: data.periodFrom,
      periodTo: data.periodTo || null,
      projectJson: parsed.data.projectJson,
      skillsJson: data.skillsJson,
    },
  });

  await prisma.skillSheet.update({
    where: {
      userId: s.userId,
      companyId: s.companyId,
    },
    data: {
      updatedAt: new Date()
    },
  })

  return NextResponse.json({ ok: true });
}