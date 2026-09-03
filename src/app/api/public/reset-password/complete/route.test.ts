import { describe, it, expect, vi } from "vitest";
import { prismaMock } from "@test/mockPrisma";
import { jsonRequest } from "@test/helpers";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("bcryptjs", () => ({ hash: vi.fn().mockResolvedValue("hashed") }));

import { POST } from "./route";

describe("POST /api/public/reset-password/complete", () => {
  it("token/passwordが無ければ400", async () => {
    const res = await POST(jsonRequest("http://test", { token: "", password: "" }));
    expect(res.status).toBe(400);
  });

  it("パスワードが8文字未満なら400", async () => {
    const res = await POST(jsonRequest("http://test", { token: "t", password: "short" }));
    expect(res.status).toBe(400);
  });

  it("トークンが存在しない/type違反/期限切れ/使用済みなら400", async () => {
    prismaMock.authToken.findUnique.mockResolvedValue({
      type: "RESET",
      usedAt: new Date(),
      expiresAt: new Date(Date.now() + 100000),
      user: { id: "u1", companyId: "c1" },
    } as any);
    const res = await POST(jsonRequest("http://test", { token: "t", password: "password123" }));
    expect(res.status).toBe(400);
  });

  it("招待と異なりpasswordHashの既存有無は問わず成功し、isActiveは変更しない", async () => {
    prismaMock.authToken.findUnique.mockResolvedValue({
      type: "RESET",
      usedAt: null,
      expiresAt: new Date(Date.now() + 100000),
      user: { id: "u1", companyId: "c1" },
    } as any);
    prismaMock.$transaction.mockImplementation(async (fn: any) => fn(prismaMock));
    prismaMock.user.update.mockResolvedValue({} as any);
    prismaMock.authToken.update.mockResolvedValue({} as any);
    prismaMock.authToken.deleteMany.mockResolvedValue({ count: 0 });

    const res = await POST(jsonRequest("http://test", { token: "t", password: "password123" }));

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { passwordHash: "hashed" },
    });
    expect(prismaMock.authToken.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: "u1", type: "RESET" }) })
    );
    expect(res.status).toBe(200);
  });

  it("Prismaが例外を投げた場合は500", async () => {
    prismaMock.authToken.findUnique.mockRejectedValue(new Error("boom"));

    const res = await POST(jsonRequest("http://test", { token: "t", password: "password123" }));
    expect(res.status).toBe(500);
  });
});
