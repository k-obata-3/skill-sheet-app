import { AppButton } from "@/components/ui/AppButton";
import { requireSession } from "@/lib/auth/require";

export default async function DevelopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession();

  return (
    <>
      <div className="p-3">
        <h4>開発ページ</h4>
        <div className="d-flex justify-content-start pb-3 mb-3 border-bottom">
          <AppButton variant="secondary" outline={true} size="sm" href="/" className="me-2">アプリTOP</AppButton>
          <AppButton outline={true} size="sm" href="/develop/ui" className="me-2">カラー</AppButton>
          <AppButton outline={true} size="sm" href="/develop/register-company" className="me-2">会社登録</AppButton>
          <AppButton outline={true} size="sm" href="/develop/docs">機能要件書</AppButton>
        </div>
        {children}
      </div>
    </>
  );
}
