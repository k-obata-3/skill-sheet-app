import { describe, it, expect, vi } from "vitest";
import { prismaMock } from "@test/mockPrisma";
import { makeSession, jsonRequest, params } from "@test/helpers";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/require", () => ({ requireAdmin: vi.fn() }));

import { requireAdmin } from "@/lib/auth/require";
import { POST } from "./route";

describe("POST /api/admin/users/[id]/invite", () => {
  it("passwordHashがnullのユーザーが見つからなければ404", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());
    prismaMock.user.findFirst.mockResolvedValue(null);

    const res = await POST(jsonRequest("http://test", undefined, { method: "POST" }), params({ id: "u1" }));

    expect(prismaMock.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "u1", companyId: "company-1", passwordHash: null } })
    );
    expect(res.status).toBe(404);
  });

  it("成功時はINVITEトークンを発行しURLを返す", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());
    prismaMock.user.findFirst.mockResolvedValue({ id: "u1" } as any);
    prismaMock.$transaction.mockImplementation(async (fn: any) => fn(prismaMock));
    prismaMock.authToken.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.authToken.create.mockResolvedValue({} as any);

    const res = await POST(jsonRequest("http://test", undefined, { method: "POST" }), params({ id: "u1" }));

    expect(prismaMock.authToken.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { companyId: "company-1", userId: "u1", type: "INVITE", usedAt: null } })
    );
    expect(prismaMock.authToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ companyId: "company-1", userId: "u1", type: "INVITE" }),
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.inviteUrl).toContain("/invite/");
  });

  it("Prismaが例外を投げた場合は500", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());
    prismaMock.user.findFirst.mockRejectedValue(new Error("boom"));

    const res = await POST(jsonRequest("http://test", undefined, { method: "POST" }), params({ id: "u1" }));
    expect(res.status).toBe(500);
  });
});
