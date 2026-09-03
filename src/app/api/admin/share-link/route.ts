import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require";
import { generateToken } from "@/lib/auth/inviteToken";

export async function POST(
  req: Request,
) {
  try {
    const { companyId } = await requireAdmin();
    const body = await req.json();

    // URLのベース（運用: 同一オリジン想定）
    const origin = new URL(req.url).origin;
    const expiresAt = body.expiryDate ?? null;

    const raw = generateToken();
    await prisma.sharedLinkUrl.create({
      data: {
        companyId,
        userId: body.userId,
        token: raw,
        type: "SKILLSHEET",
        expiresAt: expiresAt,
        comment: body.comment,
      },
    });

    const shareLinkUrl = `${origin}/share/${raw}`;

    return NextResponse.json({ shareLinkUrl, expiresAt });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { companyId } = await requireAdmin();
  const body = await req.json();

  if(body?.id) {
    await prisma.sharedLinkUrl.delete({
      where: {
        id: body.id,
      }
    });
  } else {
    // expiresAt は "YYYY-MM-DD" 文字列（辞書順=時系列順）で保存されているため、
    // 今日の日付文字列との比較で期限切れ（今日より前の日付）を直接絞り込む
    const todayStr = new Date().toISOString().slice(0, 10);

    await prisma.sharedLinkUrl.deleteMany({
      where: {
        companyId,
        expiresAt: { not: null, lt: todayStr },
      },
    });
  }

  return NextResponse.json({ ok: true });
}
