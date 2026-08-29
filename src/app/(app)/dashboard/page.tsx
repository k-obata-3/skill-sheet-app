import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/require";
import { buildSkillRanking } from "@/lib/skill/skillSummary";
import PageComponent from "@/components/layout/PageComponent";
import DashboardUI from "./ui";

export default async function DashboardPage() {
  const session = await requireSession();

  const sheet = await prisma.skillSheet.findFirst({
    where: {
      userId: session.userId,
      companyId: session.companyId
    },
    select: {
      id: true,
      _count: {
        select: { projects: true },
      }
    },
  });

  let userCount: number | undefined;
  if (session.role !== "MEMBER") {
    userCount = await prisma.user.count({
      where: {
        companyId: session.companyId
      },
    });
  }


  const projects = await prisma.skillProject.findMany({
    where: {
      companyId: session.companyId,
      skillSheet: {
        user: {
          isActive: true,
        }
      }
    },
    select: {
      periodFrom: true,
      periodTo: true,
      skillsJson: true,
      skillSheet: {
        select: {
          userId: true
        }
      },
    },
  });

  const myRanking = buildSkillRanking(projects.filter(p => p.skillSheet.userId === session.userId) ?? []);
  const companyRanking = buildSkillRanking(projects ?? []);
  return (
    <PageComponent title="ダッシュボード">
      <DashboardUI
        role={session.role}
        sheet={sheet}
        userCount={userCount}
        myRanking={myRanking}
        companyRanking={companyRanking}
      />
    </PageComponent>
  );
}
