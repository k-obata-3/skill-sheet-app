import { describe, it, expect, vi } from "vitest";
import { prismaMock } from "@test/mockPrisma";
import { makeSession, jsonRequest, params } from "@test/helpers";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/require", () => ({ requireAdmin: vi.fn() }));

import { requireAdmin } from "@/lib/auth/require";
import { PATCH, DELETE } from "./route";

describe("PATCH /api/admin/skill-master/[id]", () => {
  it("companyIdでスコープしてisActiveを更新する", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());
    prismaMock.skillMaster.updateMany.mockResolvedValue({ count: 1 });

    const res = await PATCH(
      jsonRequest("http://test", { isActive: false }, { method: "PATCH" }),
      params({ id: "sm-1" })
    );

    expect(prismaMock.skillMaster.updateMany).toHaveBeenCalledWith({
      where: { id: "sm-1", companyId: "company-1" },
      data: { isActive: false },
    });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  it("対象が0件（他社データ等）なら404", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());
    prismaMock.skillMaster.updateMany.mockResolvedValue({ count: 0 });

    const res = await PATCH(
      jsonRequest("http://test", { isActive: false }, { method: "PATCH" }),
      params({ id: "sm-x" })
    );
    expect(res.status).toBe(404);
  });

  it("バリデーションエラーなら400", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());

    const res = await PATCH(
      jsonRequest("http://test", { isActive: "yes" }, { method: "PATCH" }),
      params({ id: "sm-1" })
    );
    expect(res.status).toBe(400);
    expect(prismaMock.skillMaster.updateMany).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/admin/skill-master/[id]", () => {
  it("companyIdでスコープして削除する", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());
    prismaMock.skillMaster.deleteMany.mockResolvedValue({ count: 1 });

    const res = await DELETE(jsonRequest("http://test", undefined, { method: "DELETE" }), params({ id: "sm-1" }));

    expect(prismaMock.skillMaster.deleteMany).toHaveBeenCalledWith({
      where: { id: "sm-1", companyId: "company-1" },
    });
    expect(res.status).toBe(200);
  });

  it("対象が0件なら404", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());
    prismaMock.skillMaster.deleteMany.mockResolvedValue({ count: 0 });

    const res = await DELETE(jsonRequest("http://test", undefined, { method: "DELETE" }), params({ id: "sm-x" }));
    expect(res.status).toBe(404);
  });
});
