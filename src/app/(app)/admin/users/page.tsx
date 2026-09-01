import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require";
import PageComponent from "@/components/layout/PageComponent";
import UsersAdminUI from "./ui";

export default async function AdminUsersPage() {
  const session = await requireAdmin();

  const users = await prisma.user.findMany({
    where: {
      companyId: session.companyId
    },
    orderBy: {
      createdAt: "desc"
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      passwordHash: true,
      createdAt: true,
      skillSheet: {
        select: {
          _count: {
            select: { projects: true },
          }
        }
      }
    },
  });

  return (
    <PageComponent title="ユーザ管理">
      <UsersAdminUI users={users.map(({ passwordHash, ...u }) => ({ ...u, invited: passwordHash == null }))} />
    </PageComponent>
  );
}
