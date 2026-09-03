import { describe, it, expect, vi } from "vitest";
import { prismaMock } from "@test/mockPrisma";
import { jsonRequest } from "@test/helpers";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/password", () => ({ verifyPassword: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ setSession: vi.fn() }));

import { verifyPassword } from "@/lib/auth/password";
import { setSession } from "@/lib/auth/session";
import { POST } from "./route";

describe("POST /api/auth/login", () => {
  it("email/passwordが未入力なら400", async () => {
    const res = await POST(jsonRequest("http://test", { email: "", password: "" }));
    expect(res.status).toBe(400);
  });

  it("activeなユーザーが存在しない場合は401", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);

    const res = await POST(jsonRequest("http://test", { email: "a@example.com", password: "pw" }));

    expect(prismaMock.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: "a@example.com", isActive: true } })
    );
    expect(res.status).toBe(401);
  });

  it("パスワード不一致なら401", async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: "u1",
      companyId: "c1",
      role: "MEMBER",
      passwordHash: "hash",
    } as any);
    vi.mocked(verifyPassword).mockResolvedValue(false);

    const res = await POST(jsonRequest("http://test", { email: "a@example.com", password: "wrong" }));
    expect(res.status).toBe(401);
  });

  it("成功時はsetSessionを呼びok:trueを返す", async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: "u1",
      companyId: "c1",
      role: "MEMBER",
      passwordHash: "hash",
    } as any);
    vi.mocked(verifyPassword).mockResolvedValue(true);

    const res = await POST(jsonRequest("http://test", { email: "a@example.com", password: "correct" }));

    expect(setSession).toHaveBeenCalledWith({ userId: "u1", companyId: "c1", role: "MEMBER" });
    expect(res.status).toBe(200);
  });
});
