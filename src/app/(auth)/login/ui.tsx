"use client";

import { useState } from "react";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import { Form } from "react-bootstrap";

export default function LoginUI() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    setLoading(false);

    if (!res.ok) {
      const j = await res.json().catch(() => null);
      setErr(j?.message ?? "ログインに失敗しました");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <>
      <AppCard className="shadow-sm mb-3">
        <div className="text-center mb-1">
          <img src="/skillsheet-logo.svg" alt="スキルシート管理" height={80} />
        </div>

        {err ? <div className="alert alert-danger">{err}</div> : null}

        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <AppInput value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <AppInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
            />
          </Form.Group>

          <AppButton size="sm" type="submit" disabled={loading} className="w-100">
            {loading ? "ログイン中..." : "ログイン"}
          </AppButton>
        </Form>
      </AppCard>
    </>
  );
}
