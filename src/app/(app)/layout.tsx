import { requireSession } from "@/lib/auth/require";
import AppLayoutUI from "./layout.ui";

export const metadata = {
  title: "スキルシート管理",
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <AppLayoutUI
      user={{
        id: session.userId,
        role: session.role,
      }}
    >
      {children}
    </AppLayoutUI>
  );
}
