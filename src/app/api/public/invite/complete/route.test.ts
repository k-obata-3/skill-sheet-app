import { describe, it, expect, vi } from "vitest";
import { prismaMock } from "@test/mockPrisma";
import { jsonRequest } from "@test/helpers";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("bcryptjs", () => ({ hash: vi.fn().mockResolvedValue("hashed") }));

import { POST } from "./route";

describe("POST /api/public/invite/complete", () => {
  it("token/passwordが無ければ400", async () => {
    const res = await POST(jsonRequest("http://test", { token: "", password: "" }));
    expect(res.status).toBe(400);
  });

  it("パスワードが8文字未満なら400", async () => {
    const res = await POST(jsonRequest("http://test", { token: "t", password: "short" }));
    expect(res.status).toBe(400);
  });

  it("トークンが存在しなければ400", async () => {
    prismaMock.authToken.findUnique.mockResolvedValue(null);
    const res = await POST(jsonRequest("http://test", { token: "t", password: "password123" }));
    expect(res.status).toBe(400);
  });

  it("使用済みトークンは400", async () => {
    prismaMock.authToken.findUnique.mockResolvedValue({
      type: "INVITE",
      usedAt: new Date(),
      expiresAt: new Date(Date.now() + 100000),
      user: { id: "u1", companyId: "c1", passwordHash: null },
    } as any);
    const res = await POST(jsonRequest("http://test", { token: "t", password: "password123" }));
    expect(res.status).toBe(400);
  });

  it("既にパスワード設定済みのユーザーなら400", async () => {
    prismaMock.authToken.findUnique.mockResolvedValue({
      type: "INVITE",
      usedAt: null,
      expiresAt: new Date(Date.now() + 100000),
      user: { id: "u1", companyId: "c1", passwordHash: "already-set" },
    } as any);
    const res = await POST(jsonRequest("http://test", { token: "t", password: "password123" }));
    expect(res.status).toBe(400);
  });

  it("成功時はpasswordHash更新・isActive:true・トークンused化する", async () => {
    prismaMock.authToken.findUnique.mockResolvedValue({
      type: "INVITE",
      usedAt: null,
      expiresAt: new Date(Date.now() + 100000),
      user: { id: "u1", companyId: "c1", passwordHash: null },
    } as any);
    prismaMock.$transaction.mockImplementation(async (fn: any) => fn(prismaMock));
    prismaMock.user.update.mockResolvedValue({} as any);
    prismaMock.authToken.update.mockResolvedValue({} as any);
    prismaMock.authToken.deleteMany.mockResolvedValue({ count: 0 });

    const res = await POST(jsonRequest("http://test", { token: "t", password: "password123" }));

    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "u1" },
        data: expect.objectContaining({ passwordHash: "hashed", isActive: true }),
      })
    );
    expect(prismaMock.authToken.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ usedAt: expect.any(Date) }) })
    );
    expect(res.status).toBe(200);
  });

  it("Prismaが例外を投げた場合は500", async () => {
    prismaMock.authToken.findUnique.mockRejectedValue(new Error("boom"));

    const res = await POST(jsonRequest("http://test", { token: "t", password: "password123" }));
    expect(res.status).toBe(500);
  });
});
