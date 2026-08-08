import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/require";
import { NextResponse } from "next/server";

export async function DELETE(_: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const s = await requireSession();
  const { projectId } = await params;

  const existing = await prisma.skillProject.findFirst({
    where: {
      id: projectId,
      companyId: s.companyId,
      skillSheet: { userId: s.userId },
    }
  });

  if (!existing) {
    return NextResponse.json({ ok: true });
  }

  await prisma.skillProject.delete({
    where: {
      id: projectId
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