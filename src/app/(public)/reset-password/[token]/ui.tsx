"use client";

import { useState } from "react";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";

export default function ResetPasswordUI({
  token,
  valid,
  user,
}: {
  token: string;
  valid: boolean;
  user: { id: string; name: string; email: string } | null;
}) {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    setMsg(null);
    if (!valid) return;

    if (password.length < 8) {
      setMsg("パスワードは8文字以上にしてください。");
      return;
    }
    if (password !== password2) {
      setMsg("パスワードが一致しません。");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/public/reset-password/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.message ?? "設定に失敗しました。");
        return;
      }

      setMsg("設定が完了しました。ログインしてください。");
      // ログイン画面へ遷移
      location.href = "/login";
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: "24px auto" }}>
      <AppCard className="shadow-sm mb-3">
        {!valid ? (
          <>
            <h2 style={{ marginBottom: 8 }}>リンクが無効です</h2>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              期限切れ、または既に使用済みの可能性があります。管理者に再発行を依頼してください。
            </p>
          </>
        ) : (
          <>
            <h2 className="mb-3 text-center">パスワードの再設定</h2>
            <p className="text-muted" style={{ marginBottom: 16 }}>
              {user?.name}（{user?.email}）
            </p>

            <div style={{ display: "grid", gap: 12 }}>
              <AppInput
                type="password"
                placeholder="新しいパスワード（8文字以上）"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <AppInput
                type="password"
                placeholder="新しいパスワード（確認）"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
              />

              {msg && <div className="text-muted">{msg}</div>}

              <AppButton onClick={submit} disabled={loading}>
                設定する
              </AppButton>
            </div>
          </>
        )}
      </AppCard>
    </div>
  );
}
