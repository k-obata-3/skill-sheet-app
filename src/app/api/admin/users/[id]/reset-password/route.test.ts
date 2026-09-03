import { describe, it, expect, vi } from "vitest";
import { prismaMock } from "@test/mockPrisma";
import { makeSession, jsonRequest, params } from "@test/helpers";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/require", () => ({ requireAdmin: vi.fn() }));

import { requireAdmin } from "@/lib/auth/require";
import { POST } from "./route";

describe("POST /api/admin/users/[id]/reset-password", () => {
  it("招待と異なりpasswordHash条件を付けずcompanyIdのみでスコープする", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());
    prismaMock.user.findFirst.mockResolvedValue({ id: "u1" } as any);
    prismaMock.$transaction.mockImplementation(async (fn: any) => fn(prismaMock));
    prismaMock.authToken.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.authToken.create.mockResolvedValue({} as any);

    const res = await POST(jsonRequest("http://test", undefined, { method: "POST" }), params({ id: "u1" }));

    expect(prismaMock.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "u1", companyId: "company-1" } })
    );
    expect(prismaMock.authToken.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { companyId: "company-1", userId: "u1", type: "RESET", usedAt: null } })
    );
    expect(prismaMock.authToken.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: "RESET" }) })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.resetUrl).toContain("/reset-password/");
  });

  it("有効期限は3時間後に設定される", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());
    prismaMock.user.findFirst.mockResolvedValue({ id: "u1" } as any);
    prismaMock.$transaction.mockImplementation(async (fn: any) => fn(prismaMock));

    const before = Date.now();
    await POST(jsonRequest("http://test", undefined, { method: "POST" }), params({ id: "u1" }));
    const after = Date.now();

    const createArgs = prismaMock.authToken.create.mock.calls[0][0] as any;
    const expiresAtMs = new Date(createArgs.data.expiresAt).getTime();
    expect(expiresAtMs).toBeGreaterThanOrEqual(before + 3 * 60 * 60 * 1000 - 1000);
    expect(expiresAtMs).toBeLessThanOrEqual(after + 3 * 60 * 60 * 1000 + 1000);
  });

  it("対象ユーザーが存在しなければ404", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());
    prismaMock.user.findFirst.mockResolvedValue(null);

    const res = await POST(jsonRequest("http://test", undefined, { method: "POST" }), params({ id: "u1" }));
    expect(res.status).toBe(404);
  });

  it("Prismaが例外を投げた場合は500", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());
    prismaMock.user.findFirst.mockRejectedValue(new Error("boom"));

    const res = await POST(jsonRequest("http://test", undefined, { method: "POST" }), params({ id: "u1" }));
    expect(res.status).toBe(500);
  });
});
