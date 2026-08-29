import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require";
import PageComponent from "@/components/layout/PageComponent";
import RegisterCompanyUI from "./ui";

export default async function RegisterCompanyPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  await requireAdmin();

  return (
    <PageComponent title="会社登録">
      <RegisterCompanyUI />
    </PageComponent>
  );
}
