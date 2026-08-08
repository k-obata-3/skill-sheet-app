import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require";
import { Role } from "@prisma/client";
import { InviteUserSchema } from "@/lib/validation/user";

export async function GET() {
  const s = await requireAdmin();

  const users = await prisma.user.findMany({
    where: { companyId: s.companyId },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true }
  });

  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const s = await requireAdmin();
  const body = await req.json();
  const parsed = InviteUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "バリデーションエラー", errors: parsed.success ? null : parsed.error.flatten() },
      { status: 400 }
    );
  }

  const user = await prisma.user.create({
    data: {
      companyId: s.companyId,
      email: parsed.data.email,
      name: parsed.data.name,
      role: parsed.data.role,
      isActive: false
    },
    select: { id: true, email: true, name: true, role: true, isActive: true }
  });

  return NextResponse.json({ user });
}
