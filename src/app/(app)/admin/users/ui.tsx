"use client";

import { InviteUrlModal } from "@/components/InviteUrlModal";
import { AppBadge } from "@/components/ui/AppBadge";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { useState } from "react";
import { Table } from "react-bootstrap";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  isActive: boolean;
  invited: boolean;
  createdAt: string | Date;
  skillSheet: {
    _count: {
      projects: number;
    }
  } | null;
};

export default function UsersAdminUI({ users }: { users: UserRow[] }) {
  const [inviteUserId, setInviteUserId] = useState<string | null>(null);

  return (
    <div>
      <div className="d-flex align-items-center mb-3">
        <div className="ms-auto">
          <AppButton href="/admin/users/new" size="sm">新規作成</AppButton>
        </div>
      </div>

      <AppCard className="shadow-sm">
        <Table responsive className="mb-0">
          <thead>
            <tr>
              <th>名前</th>
              <th>メールアドレス</th>
              <th>権限</th>
              <th>状態</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="text-nowrap">
                <td>{u.name}</td>
                <td className="text-muted">{u.email}</td>
                <td>{u.role === "OWNER" ? "管理者" : u.role === "ADMIN" ? "マネージャー" : "一般"}</td>
                <td>
                  {u.invited ? <AppBadge tone="warning">招待中</AppBadge> : u.isActive ? <AppBadge tone="success">有効</AppBadge> : <AppBadge tone="secondary">無効</AppBadge>}
                </td>
                <td className="text-end">
                  <>
                    {u.invited && (
                      <AppButton variant="secondary" outline={true} size="sm" onClick={() => setInviteUserId(u.id)} className="me-2">
                        招待リンク再発行
                      </AppButton>
                    )}
                    {!!u.skillSheet?._count.projects && (
                      <AppButton variant="secondary" outline={true} size="sm" as="a" href={`/pdf/skill-sheet/${u.id}`} target="_blank" className="me-2">
                        PDF
                      </AppButton>
                    )}
                    <AppButton size="sm" href={`/admin/users/${u.id}`}>
                      編集
                    </AppButton>
                  </>
                </td>
              </tr>
            ))}
            {!users.length ? (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  ユーザがいません
                </td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </AppCard>

      <InviteUrlModal title="招待リンク" userId={inviteUserId!} onClose={() => { setInviteUserId(null); }} show={inviteUserId ? true : false} />
    </div>
  );
}
