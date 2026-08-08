import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require";
import { UserSchema } from "@/lib/validation/user";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await requireAdmin();
  const { id } = await params;

  const user = await prisma.user.findFirst({
    where: { id: id, companyId: s.companyId },
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true }
  });

  if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const sheet = await prisma.skillSheet.findFirst({
    where: { companyId: s.companyId, userId: id }
  });

  return NextResponse.json({ user, sheet });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await requireAdmin();
  const { id } = await params;
  const body = await req.json();
  const parsed = UserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "バリデーションエラー", errors: parsed.success ? null : parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updated = await prisma.user.updateMany({
    where: {
      id: id,
      companyId: s.companyId
    },
    data: {
      name: parsed.data.name,
      subName: parsed.data.subName,
      role: parsed.data.role,
      dateOfBirth: parsed.data.dateOfBirth,
      isActive: parsed.data.isActive,
    }
  });

  if (updated.count === 0) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
