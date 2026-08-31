import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require";
import { ToggleSkillMasterSchema } from "@/lib/validation/skillMaster";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await requireAdmin();
  const { id } = await params;
  const body = await req.json();
  const parsed = ToggleSkillMasterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "バリデーションエラー", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updated = await prisma.skillMaster.updateMany({
    where: { id, companyId: s.companyId },
    data: {
      isActive: parsed.data.isActive,
    },
  });

  if (updated.count === 0) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await requireAdmin();
  const { id } = await params;

  const deleted = await prisma.skillMaster.deleteMany({
    where: { id, companyId: s.companyId },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
