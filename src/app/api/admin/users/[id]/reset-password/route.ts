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
      },
      select: {
        id: true
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // リセットURLのベース（運用: 同一オリジン想定）
    const origin = new URL(req.url).origin;

    // 3時間有効
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000);

    const raw = generateToken();
    const tokenHash = hashToken(raw);

    await prisma.$transaction(async (tx) => {
      // 既存の未使用RESETを無効化
      await tx.authToken.deleteMany({
        where: { companyId, userId: id, type: "RESET", usedAt: null },
      });

      await tx.authToken.create({
        data: {
          companyId,
          userId: id,
          tokenHash,
          type: "RESET",
          expiresAt,
        },
      });
    });

    const resetUrl = `${origin}/reset-password/${raw}`;

    return NextResponse.json({ resetUrl, expiresAt });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
