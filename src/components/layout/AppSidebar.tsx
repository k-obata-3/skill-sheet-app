"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Props = {
  isAdmin: boolean;
  open?: boolean;
  onClose?: () => void;
};

export function AppSidebar({ isAdmin, open, onClose }: Props) {
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <>
      {/* Overlay (mobile only) */}
      {open && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`app-sidebar ${open ? "open" : ""}`}>
        <div className="app-sidebar-header">
          <img src="/skillsheet-logo.svg" alt="スキルシート管理" height={45} />
        </div>
        <div className="app-sidebar-mobile-header">
          <div className="sidebar-close" onClick={onClose}></div>
        </div>

        <nav className="app-sidebar-nav">
          <SidebarItem
            href="/dashboard"
            icon={<></>}
            label="ダッシュボード"
            active={pathname.startsWith("/dashboard")}
            onClick={() => onClose}
          />
          <SidebarItem
            href="/projects"
            icon={<></>}
            label="案件一覧"
            active={pathname.startsWith("/projects")}
            onClick={() => onClose}
          />
          {isAdmin && (
            <>
              <SidebarItem
                href="/admin/users"
                icon={<></>}
                label="ユーザ管理"
                active={pathname.startsWith("/admin/users")}
                onClick={() => onClose}
              />
              <SidebarItem
                href="/admin/shareLink"
                icon={<></>}
                label="共有リンク管理"
                active={pathname.startsWith("/admin/shareLink")}
                onClick={() => onClose}
              />
            </>
          )}
          
          {process.env.NODE_ENV !== 'production' && (
            <SidebarItem
              href="/develop"
              icon={<></>}
              label="開発ページ"
              active={pathname.startsWith("/develop")}
              onClick={() => onClose}
              borderTop
            />
          )}
        </nav>

        <div className="app-sidebar-footer">
          <div className="sidebar-item muted" onClick={logout}>ログアウト</div>
        </div>
      </aside>
    </>
  );
}


/* --------------------------------
   SidebarItem
--------------------------------- */
function SidebarItem({
  href,
  icon,
  label,
  active,
  muted,
  onClick,
  borderTop=false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  muted?: boolean;
  onClick: () => void;
  borderTop?: boolean;
}) {
  return (
    <>
      <Link
        href={href}
        onClick={onClick}
        className={[
          "sidebar-item",
          active ? "active" : "",
          muted ? "muted" : "",
          borderTop ? "bound-line" : ""
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {icon}
        <span>{label}</span>
      </Link>
    </>
  );
}