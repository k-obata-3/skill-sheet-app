"use client";

import { Role } from "@prisma/client";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { ConfirmProvider } from "@/components/ui/ConfirmProvider";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function AppLayoutUI({
  user,
  children,
}: {
  user: { id: string; role: Role };
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isAdmin = user.role === "ADMIN" || user.role === "OWNER";

  /* ルート遷移時に自動クローズ */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /* Esc キーで閉じる */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <ToastProvider>
      <ConfirmProvider>
        <div className="app-layout">
          {/* Header (mobile only) */}
          <header className="app-header">
            <div className="hamburger" onClick={() => setOpen(true)} aria-label="メニュー">
              <span />
              <span />
              <span />
            </div>
            <img src="/skillsheet-logo.svg" alt="スキルシート管理" height={45} />
          </header>
          <AppSidebar open={open} onClose={() => setOpen(false)} isAdmin={isAdmin} />
          <main className="app-main">
            {children}
          </main>
        </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}
