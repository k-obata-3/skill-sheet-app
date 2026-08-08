import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require";
import { headers } from "next/headers";
import PageComponent from "@/components/layout/PageComponent";
import ShareLinkAdminUI from "./ui";

export default async function AdminShareLinkPage() {
  const session = await requireAdmin();

  const users = await prisma.user.findMany({
    where: {
      companyId: session.companyId,
      isActive: true,
    },
    orderBy: {
      createdAt: "desc"
    },
    select: {
      id: true,
      name: true,
      skillSheet: {
        select: {
          _count: {
            select: { projects: true },
          }
        }
      },
    },
  });

  const sharedLink = await prisma.sharedLinkUrl.findMany({
    where: {
      companyId: session.companyId,
      type: "SKILLSHEET",
    },
    select: {
      id: true,
      userId: true,
      token: true,
      expiresAt: true,
      comment: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc"
    },
  })

  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const proto = headersList.get("x-forwarded-proto") ?? "http";
  const baseUrl = `${proto}://${host}`;

  return (
    <PageComponent title="共有リンク管理">
      <ShareLinkAdminUI users={users.filter(user => !!user.skillSheet?._count.projects)} sharedLinks={sharedLink} baseUrl={baseUrl} />
    </PageComponent>
  );
}