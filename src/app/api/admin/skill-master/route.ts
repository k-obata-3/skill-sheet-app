import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require";
import { CreateSkillMasterSchema } from "@/lib/validation/skillMaster";

export async function POST(req: Request) {
  const s = await requireAdmin();
  const body = await req.json();
  const parsed = CreateSkillMasterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "バリデーションエラー", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const skillMaster = await prisma.skillMaster.create({
      data: {
        companyId: s.companyId,
        category: parsed.data.category,
        name: parsed.data.name,
      },
    });

    return NextResponse.json({ skillMaster });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ message: "同じカテゴリ内に同名のスキルが既に登録されています" }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ message: "作成に失敗しました" }, { status: 500 });
  }
}
