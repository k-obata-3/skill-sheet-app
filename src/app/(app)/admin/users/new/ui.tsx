"use client";

import { useState } from "react";
import { Form } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppSelect } from "@/components/ui/AppSelect";
import { AppErrorAlert } from "@/components/ui/AppErrorAlert";
import { InviteUrlModal } from "@/components/InviteUrlModal";
import { useToast } from "@/components/ui/ToastProvider";

export default function UserCreateUI() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"MEMBER" | "ADMIN" | "OWNER">("MEMBER");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteUserId, setInviteUserId] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, role }),
    });

    setBusy(false);

    if (!res.ok) {
      const j = await res.json().catch(() => null);
      if(j?.message && j.errors?.fieldErrors) {
        setError(`${j?.message}\n${Object.values(j.errors.fieldErrors).flat().join("\n")}`);
      } else {
        setError(j?.message ?? "作成に失敗しました");
      }
      return;
    }

    const data = await res.json();
    setInviteUserId(data.user.id);
    showToast("ユーザーを登録しました");
  }

  return (
    <div>
      <div className="d-flex align-items-center mb-3">
        <div className="ms-auto">
          <AppButton variant="secondary" outline={true} size="sm" onClick={() => router.back()}>キャンセル</AppButton>
        </div>
      </div>

      <AppCard className="shadow-sm">
        <AppErrorAlert message={error} />

        <Form onSubmit={submit}>
          <Form.Group className="mb-3">
            <Form.Label>メールアドレス</Form.Label>
            <AppInput value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>名前</Form.Label>
            <AppInput value={name} onChange={(e) => setName(e.target.value)} />
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
            <AppButton size="sm" type="submit" disabled={busy}>
              {busy ? "作成中..." : "作成"}
            </AppButton>
          </div>
        </Form>
      </AppCard>

      <InviteUrlModal title="招待リンク" userId={inviteUserId!} onClose={() => { router.push("/admin/users"); }} show={inviteUserId ? true : false} />
    </div>
  );
}
