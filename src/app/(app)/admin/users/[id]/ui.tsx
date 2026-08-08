"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Alert } from "react-bootstrap";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppSelect } from "@/components/ui/AppSelect";

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

  const [name, setName] = useState(user.name);
  const [subName, setSubName] = useState(user.subName);
  const [role, setRole] = useState<UserDetail["role"]>(user.role);
  const [dateOfBirth, setDateOfBirth] = useState(user.dateOfBirth);
  const [isActive, setIsActive] = useState(user.isActive);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setMsg(null);
    setBusy(true);
    setError(null)

    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        subName,
        role,
        dateOfBirth,
        isActive
      }),
    });

    setBusy(false);

    if (!res.ok) {
      const j = await res.json().catch(() => null);
      if(j?.message && j.errors?.fieldErrors) {
        setError(`${j?.message}\n${Object.values(j.errors.fieldErrors).flat().join("\n")}`);
      } else {
        setError(j?.message ?? "更新に失敗しました");
      }
      return;
    }

    setMsg("更新しました");
    router.refresh();
  }

  return (
    <div>
      <div className="d-flex align-items-center mb-3">
        <div className="ms-auto d-flex">
          <AppButton variant="secondary" outline={true} size="sm" onClick={() => router.push("/admin/users")}>
            キャンセル
          </AppButton>
        </div>
      </div>

      {!user.skillSheet?._count.projects && user.isActive && (
        <Alert variant="warning">案件が登録されていません</Alert>
      )}
      <AppCard className="shadow-sm mb-3">
        {msg && <Alert variant="success">{msg}</Alert>}
        {error && <Alert variant="danger" style={{whiteSpace: "pre-wrap"}}>{error}</Alert>}

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
