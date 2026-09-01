import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

type Body = {
  companyName?: string;
  ownerName?: string;
  ownerEmail?: string;
  password?: string;
};

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }

  try {
    const body = (await req.json()) as Body;

    const companyName = (body.companyName ?? "").trim();
    const ownerName = (body.ownerName ?? "").trim();
    const ownerEmail = (body.ownerEmail ?? "").trim().toLowerCase();
    const password = body.password ?? "";

    // ---- validation (最低限) ----
    if (!companyName || !ownerName || !ownerEmail || !password) {
      return NextResponse.json({ message: "入力が不足しています。" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: "パスワードは8文字以上にしてください。" }, { status: 400 });
    }

    // 簡易メール形式チェック（厳密にするなら zod 推奨）
    if (!ownerEmail.includes("@") || ownerEmail.length > 200) {
      return NextResponse.json({ message: "メールアドレスが不正です。" }, { status: 400 });
    }

    if (companyName.length > 200 || ownerName.length > 200) {
      return NextResponse.json({ message: "入力が長すぎます。" }, { status: 400 });
    }

    // ---- hash password ----
    const passwordHash = await hash(password, 12);

    // ---- create in transaction ----
    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyName
        },
        select: {
          id: true
        },
      });

      const user = await tx.user.create({
        data: {
          companyId: company.id,
          email: ownerEmail,
          name: ownerName,
          role: "OWNER",
          isActive: true,
          passwordHash,
        },
        select: {
          id: true,
          companyId: true
        },
      });

      return { companyId: company.id, ownerUserId: user.id };
    });

    return NextResponse.json({
      success: true,
      companyId: result.companyId,
      ownerUserId: result.ownerUserId,
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ message: "登録に失敗しました。" }, { status: 500 });
  }
}
