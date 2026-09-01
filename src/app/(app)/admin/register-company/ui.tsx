"use client";

import { useState } from "react";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import { Col, Form, Row } from "react-bootstrap";

export default function RegisterCompanyUI() {
  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit() {
    try {
      const res = await fetch("/api/public/register-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          ownerName,
          ownerEmail,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("登録失敗", data);
        return;
      }

      console.log("登録完了", data);
      setTimeout(() => {
        location.href = "/login";
      }, 500);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <Row className="d-flex justify-content-center">
      <Col md={6}>
        <AppCard className="shadow-sm mb-3">
          <Form action={submit}>
            <Form.Group className="mb-3">
              <Form.Label>会社名</Form.Label>
              <AppInput
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>管理者名</Form.Label>
              <AppInput
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>管理者メールアドレス</Form.Label>
              <AppInput
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>パスワード</Form.Label>
              <AppInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                maxLength={16}
                required
              />
            </Form.Group>
            <AppButton type="submit" className="w-100">
              登録して利用開始
            </AppButton>
          </Form>
        </AppCard>
      </Col>
    </Row>
  );
}
