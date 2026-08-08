import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require";
import { generateToken, hashToken } from "@/lib/auth/inviteToken";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { companyId } = await requireAdmin(); // 管理者のみ
    const { id } = await params;

    const user = await prisma.user.findFirst({
      where: {
        id: id,
        companyId,
        passwordHash: null
      },
      select: {
        id: true
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 招待URLのベース（運用: 同一オリジン想定）
    const origin = new URL(req.url).origin;

    // 72時間有効
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    const raw = generateToken();
    const tokenHash = hashToken(raw);

    await prisma.$transaction(async (tx) => {
      // 既存の未使用INVITEを無効化（usedAtを入れる方式でもOK）
      await tx.authToken.deleteMany({
        where: { companyId, userId: id, type: "INVITE", usedAt: null },
      });

      await tx.authToken.create({
        data: {
          companyId,
          userId: id,
          tokenHash,
          type: "INVITE",
          expiresAt,
        },
      });
    });

    const inviteUrl = `${origin}/invite/${raw}`;

    return NextResponse.json({ inviteUrl, expiresAt });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
