import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { setSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: "email/password required" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: {
      email,
      isActive: true
    },
    include: {
      company: true
    }
  });

  if (!user) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  const ok = await verifyPassword(password, user.passwordHash!);
  if (!ok) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  await setSession({ userId: user.id, companyId: user.companyId, role: user.role });

  return NextResponse.json({ ok: true });
}
