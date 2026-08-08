import { requireAdmin } from "@/lib/auth/require";
import PageComponent from "@/components/layout/PageComponent";
import UserCreateUI from "./ui";

export default async function AdminUserNewPage() {
  await requireAdmin();
  return (
    <PageComponent title="ユーザ作成">
      <UserCreateUI />
    </PageComponent>
  );
}
