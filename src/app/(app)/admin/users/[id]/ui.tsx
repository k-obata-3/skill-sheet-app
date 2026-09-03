"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Alert } from "react-bootstrap";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppSelect } from "@/components/ui/AppSelect";
import { AppErrorAlert } from "@/components/ui/AppErrorAlert";
import { useToast } from "@/components/ui/ToastProvider";
import { InviteUrlModal } from "@/components/InviteUrlModal";
import { useApiRequest, HttpMethod } from "@/lib/hooks/useApiRequest";

type UserDetail = {
  id: string;
  email: string;
  name: string;
  subName: string | null;
  role: "OWNER" | "ADMIN" | "MEMBER";
  dateOfBirth: string | null;
  isActive: boolean;
  invited: boolean;
  createdAt: string | Date;
  skillSheet: {
    _count: {
      projects: number;
    }
  } | null;
};

export default function UserDetailUI({ user }: { user: UserDetail }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { request, loading: busy, error } = useApiRequest();

  const [name, setName] = useState(user.name);
  const [subName, setSubName] = useState(user.subName);
  const [role, setRole] = useState<UserDetail["role"]>(user.role);
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth);
  const [isActive, setIsActive] = useState(user.isActive);
  const [showResetModal, setShowResetModal] = useState(false);

  async function save() {
    const result = await request(
      `/api/admin/users/${user.id}`,
      { method: HttpMethod.PATCH, json: { name, subName, role, dateOfBirth, isActive } },
      "更新に失敗しました"
    );
    if (!result.ok) {
      return;
    }

    showToast("更新しました");
    router.push("/admin/users");
  }

  return (
    <div>
      <div className="d-flex align-items-center mb-3">
        <div className="ms-auto d-flex">
          {!user.invited && (
            <AppButton variant="secondary" outline={true} size="sm" onClick={() => setShowResetModal(true)} className="me-2">
              パスワード再設定リンク発行
            </AppButton>
          )}
          <AppButton variant="secondary" outline={true} size="sm" onClick={() => router.push("/admin/users")}>
            キャンセル
          </AppButton>
        </div>
      </div>

      <InviteUrlModal
        title="パスワード再設定"
        userId={user.id}
        mode="reset"
        show={showResetModal}
        onClose={() => setShowResetModal(false)}
      />

      {!user.skillSheet?._count.projects && user.isActive && (
        <Alert variant="warning">案件が登録されていません</Alert>
      )}
      <AppCard className="shadow-sm mb-3">
        <AppErrorAlert message={error} />

        {!user.invited && (
          <Form.Group>
            <Form.Check
              type="switch"
              id="isActive"
              reverse
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              label={isActive ? "有効": "無効"}
            />
          </Form.Group>
        )}

        <div className="mb-2">
          <div className="text-muted small">メールアドレス</div>
          <div>{user.email}</div>
        </div>

        <Form.Group className="mb-3">
          <Form.Label>名前</Form.Label>
          <AppInput value={name} onChange={(e) => setName(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>表示名</Form.Label>
          <AppInput value={subName ?? ""} onChange={(e) => setSubName(e.target.value)} />
          <p className="muted">※共有リンクのスキルシートで氏名に利用します。</p>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>生年月日</Form.Label>
          <Form.Control
            type="date"
            value={dateOfBirth ?? ""}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
          <p className="muted">※スキルシートに表示する年齢の算出に利用します。</p>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>権限</Form.Label>
          <AppSelect value={role} onChange={(e) => setRole(e.target.value as any)}>
            <option value="MEMBER">一般</option>
            <option value="ADMIN">マネージャー</option>
            <option value="OWNER">管理者</option>
          </AppSelect>
        </Form.Group>

        <div className="d-flex justify-content-end">
          <AppButton size="sm" onClick={save} disabled={busy}>
            {busy ? "保存中..." : "保存"}
          </AppButton>
        </div>
      </AppCard>
    </div>
  );
}
