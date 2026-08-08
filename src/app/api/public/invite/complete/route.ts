import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/auth/inviteToken";
import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = (
      await req.json()) as { token?: string; password?: string
    };

    if (!token || !password) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ message: "Password too short" }, { status: 400 });
    }

    const tokenHash = hashToken(token);
    const now = new Date();

    const invite = await prisma.authToken.findUnique({
      where: {
        tokenHash
      },
      include: {
        user: {
          select: {
            id: true,
            companyId: true,
            passwordHash: true
          }
        }
      },
    });

    const isValid =
      invite &&
      invite.type === "INVITE" &&
      !invite.usedAt &&
      invite.expiresAt > now &&
      invite.user.passwordHash == null;

    if (!isValid) {
      return NextResponse.json({ message: "Invite token is invalid" }, { status: 400 });
    }

    const passwordHash = await hash(password, 12);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: invite.user.id
        },
        data: {
          passwordHash,
          isActive: true,
        },
      });

      await tx.authToken.update({
        where: {
          tokenHash
        },
        data: {
          usedAt: now
        },
      });

      await tx.authToken.deleteMany({
        where: {
          userId: invite.user.id,
          tokenHash: {
            not: tokenHash,
          }
        }
      })
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
