import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require";
import PageComponent from "@/components/layout/PageComponent";
import UserDetailUI from "./ui";

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const session = await requireAdmin();
  const p = await params;

  const user = await prisma.user.findFirst({
    where: {
      id: p.id,
      companyId: session.companyId
    },
    select: {
      id: true,
      email: true,
      name: true,
      subName: true,
      role: true,
      dateOfBirth: true,
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

  if (!user){
    throw new Error("Not found");
  }

  const { passwordHash, ...userForUI } = user;

  return (
    <PageComponent title="ユーザ編集">
      <UserDetailUI user={{...userForUI, invited: !user.passwordHash}} />
    </PageComponent>
  );
}
