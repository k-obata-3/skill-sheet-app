"use client";

import { useState } from "react";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import { AppErrorAlert } from "@/components/ui/AppErrorAlert";
import { useApiRequest, HttpMethod } from "@/lib/hooks/useApiRequest";
import { Form } from "react-bootstrap";

export default function LoginUI() {
  const { request, loading, error } = useApiRequest();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = await request(
      "/api/auth/login",
      { method: HttpMethod.POST, json: { email, password } },
      "ログインに失敗しました"
    );
    if (!result.ok) {
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

        <AppErrorAlert message={error} />

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
