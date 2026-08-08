import PageComponent from "@/components/layout/PageComponent";
import RegisterCompanyUI from "./ui";

export default async function RegisterCompanyPage() {
  return (
    <PageComponent title="会社登録">
      <RegisterCompanyUI />
    </PageComponent>
  );
}
