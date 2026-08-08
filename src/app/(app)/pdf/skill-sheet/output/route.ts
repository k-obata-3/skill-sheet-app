import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/require";
import { renderToBuffer } from "@react-pdf/renderer";
import { SkillSheetPdfDoc } from "@/components/pdf/SkillSheetPdfDoc";

export async function GET() {
  const session = await requireSession();

  const sheet = await prisma.skillSheet.findFirst({
    where: {
      userId: session.userId,
      companyId: session.companyId,
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
    return new Response("Not Found", { status: 404 });
  }

  const buf = await renderToBuffer(
    SkillSheetPdfDoc({
      userName: sheet.user.name,
      companyName: sheet.company.name,
      dateOfBirth: sheet.user.dateOfBirth,
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
