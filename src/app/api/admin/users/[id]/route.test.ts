import { describe, it, expect, vi } from "vitest";
import { prismaMock } from "@test/mockPrisma";
import { makeSession, jsonRequest, params } from "@test/helpers";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/require", () => ({ requireAdmin: vi.fn() }));

import { requireAdmin } from "@/lib/auth/require";
import { GET, PATCH } from "./route";

const VALID_BODY = {
  name: "テスト太郎",
  subName: null,
  role: "MEMBER",
  dateOfBirth: null,
  isActive: true,
};

describe("GET /api/admin/users/[id]", () => {
  it("companyIdでスコープして取得する", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());
    prismaMock.user.findFirst.mockResolvedValue({ id: "u1" } as any);
    prismaMock.skillSheet.findFirst.mockResolvedValue(null);

    const res = await GET(jsonRequest("http://test", undefined, { method: "GET" }), params({ id: "u1" }));

    expect(prismaMock.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "u1", companyId: "company-1" } })
    );
    expect(res.status).toBe(200);
  });

  it("他社のユーザーは404", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());
    prismaMock.user.findFirst.mockResolvedValue(null);

    const res = await GET(jsonRequest("http://test", undefined, { method: "GET" }), params({ id: "other" }));
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/admin/users/[id]", () => {
  it("companyIdでスコープしてupdateManyする", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());
    prismaMock.user.updateMany.mockResolvedValue({ count: 1 });

    const res = await PATCH(jsonRequest("http://test", VALID_BODY, { method: "PATCH" }), params({ id: "u1" }));

    expect(prismaMock.user.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "u1", companyId: "company-1" } })
    );
    expect(res.status).toBe(200);
  });

  it("対象が0件（他社データ等）なら404", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());
    prismaMock.user.updateMany.mockResolvedValue({ count: 0 });

    const res = await PATCH(jsonRequest("http://test", VALID_BODY, { method: "PATCH" }), params({ id: "u1" }));
    expect(res.status).toBe(404);
  });

  it("バリデーションエラーなら400", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());

    const res = await PATCH(
      jsonRequest("http://test", { ...VALID_BODY, name: "" }, { method: "PATCH" }),
      params({ id: "u1" })
    );
    expect(res.status).toBe(400);
    expect(prismaMock.user.updateMany).not.toHaveBeenCalled();
  });
});
