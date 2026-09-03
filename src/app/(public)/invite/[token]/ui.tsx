"use client";

import { useState } from "react";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import { useApiRequest, HttpMethod } from "@/lib/hooks/useApiRequest";

export default function InviteSetPasswordUI({
  token,
  valid,
  user,
}: {
  token: string;
  valid: boolean;
  user: { id: string; name: string; email: string } | null;
}) {
  const { request, loading, error, setError } = useApiRequest();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [localMsg, setLocalMsg] = useState<string | null>(null);
  const msg = localMsg ?? error;

  async function submit() {
    setLocalMsg(null);
    setError(null);
    if (!valid) return;

    if (password.length < 8) {
      setLocalMsg("パスワードは8文字以上にしてください。");
      return;
    }
    if (password !== password2) {
      setLocalMsg("パスワードが一致しません。");
      return;
    }

    const result = await request(
      "/api/public/invite/complete",
      { method: HttpMethod.POST, json: { token, password } },
      "設定に失敗しました。"
    );
    if (!result.ok) {
      return;
    }

    setLocalMsg("設定が完了しました。ログインしてください。");
    // ログイン画面へ遷移
    location.href = "/login";
  }

  return (
    <div style={{ maxWidth: 560, margin: "24px auto" }}>
      <AppCard className="shadow-sm mb-3">
        {!valid ? (
          <>
            <h2 style={{ marginBottom: 8 }}>招待リンクが無効です</h2>
            <p className="text-muted" style={{ marginBottom: 0 }}>
              期限切れ、または既に使用済みの可能性があります。管理者に再発行を依頼してください。
            </p>
          </>
        ) : (
          <>
            <h2 className="mb-3 text-center">初回パスワード設定</h2>
            <p className="text-muted" style={{ marginBottom: 16 }}>
              {user?.name}（{user?.email}）
            </p>

            <div style={{ display: "grid", gap: 12 }}>
              <AppInput
                type="password"
                placeholder="パスワード（8文字以上）"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <AppInput
                type="password"
                placeholder="パスワード（確認）"
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
