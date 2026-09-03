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

    const reset = await prisma.authToken.findUnique({
      where: {
        tokenHash
      },
      include: {
        user: {
          select: {
            id: true,
            companyId: true,
          }
        }
      },
    });

    const isValid =
      reset &&
      reset.type === "RESET" &&
      !reset.usedAt &&
      reset.expiresAt > now;

    if (!isValid) {
      return NextResponse.json({ message: "Reset token is invalid" }, { status: 400 });
    }

    const passwordHash = await hash(password, 12);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: reset.user.id
        },
        data: {
          passwordHash,
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
          userId: reset.user.id,
          type: "RESET",
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
