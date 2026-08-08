import PageComponent from "@/components/layout/PageComponent";
import LoginUI from "./ui";

export default function LoginPage() {
  return (
    <PageComponent>
      <div className="py-5 ps-3 pe-3" style={{ maxWidth: 560, margin: "auto" }}>
        <LoginUI />
      </div>
    </PageComponent>
  );
}
