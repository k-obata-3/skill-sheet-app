import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { SkillSheetPdfDoc } from "@/components/pdf/SkillSheetPdfDoc";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const errorMsg = "リンクが存在しないか、有効期限切れのため表示できません";
  const { token } = await params;

  const sharedLink = await prisma.sharedLinkUrl.findUnique({
    where: {
      token
    },
    select: {
      userId: true,
      expiresAt: true,
    }
  });

  const [y, m, d] = sharedLink?.expiresAt?.split("-") ?? [];
  const currentDate = new Date();
  const expiresDate = sharedLink?.expiresAt ? new Date(Number(y), Number(m) - 1, Number(d) + 1) : null;
  // 補正
  currentDate.setHours(currentDate.getHours() + 9);
  expiresDate?.setHours(9, 0, 0, 0);

  if(!sharedLink || ( sharedLink.expiresAt && expiresDate &&  currentDate > expiresDate)) {
    return new Response(errorMsg, { status: 404 });
  }

  const sheet = await prisma.skillSheet.findFirst({
    where: {
      userId: sharedLink?.userId,
    },
    include: {
      user: true,
      company: true,
      projects: {
        orderBy: [
          { periodFrom: "asc" },
          { createdAt: "asc" },
        ],
      },
    },
  });

  if (!sheet) {
    return new Response(errorMsg, { status: 404 });
  }

  const buf = await renderToBuffer(
    SkillSheetPdfDoc({
      userName: sheet.user.subName ?? sheet.user.name,
      companyName: sheet.company.name,
      dateOfBirth: sheet.user.dateOfBirth,
      summary: sheet.summary,
      remarks: sheet.remarks,
      projects: sheet.projects.map((p) => ({
        name: p.name,
        periodFrom: p.periodFrom,
        periodTo: p.periodTo,
        projectJson: p.projectJson as any,
        skillsJson: p.skillsJson as any,
      })),
    })
  );

  const forbiddenChars = /[\/:*?"<>|\s]/g;
  const fileName = encodeURIComponent(`スキルシート_${sheet.user.name}.pdf`.replaceAll(forbiddenChars, "_"));

  return new Response(
    new Uint8Array(buf),
    {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          `inline; filename*=UTF-8''${fileName}`,
      },
    }
  );
}
