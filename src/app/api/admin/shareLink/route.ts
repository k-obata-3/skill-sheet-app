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
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 9);

    const sharedLinks = await prisma.sharedLinkUrl.findMany({
      where: {
        companyId: companyId,
      }
    });

    sharedLinks.forEach(async(row) => {
      const [y, m, d] = row.expiresAt?.split("-") ?? [];
      const expiresAt = row.expiresAt ? new Date(Number(y), Number(m) - 1, Number(d) + 1) : null;
      expiresAt?.setHours(9, 0, 0, 0);
      if(expiresAt && currentDate > expiresAt) {
        await prisma.sharedLinkUrl.delete({
          where: {
            id: row.id,
          }
        });
      }
    });
  }

  return NextResponse.json({ ok: true });
}
