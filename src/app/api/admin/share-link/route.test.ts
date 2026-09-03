import { describe, it, expect, vi } from "vitest";
import { prismaMock } from "@test/mockPrisma";
import { makeSession, jsonRequest } from "@test/helpers";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/require", () => ({ requireAdmin: vi.fn() }));

import { requireAdmin } from "@/lib/auth/require";
import { POST, DELETE } from "./route";

describe("POST /api/admin/share-link", () => {
  it("companyIdを付与して作成する", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());
    prismaMock.sharedLinkUrl.create.mockResolvedValue({} as any);

    const res = await POST(
      jsonRequest("http://test", { userId: "u1", expiryDate: "2026-01-01", comment: "memo" })
    );

    expect(prismaMock.sharedLinkUrl.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ companyId: "company-1", userId: "u1", type: "SKILLSHEET" }),
      })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.shareLinkUrl).toContain("/share/");
  });

  it("Prismaが例外を投げた場合は500", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());
    prismaMock.sharedLinkUrl.create.mockRejectedValue(new Error("boom"));

    const res = await POST(
      jsonRequest("http://test", { userId: "u1", expiryDate: "2026-01-01", comment: "memo" })
    );
    expect(res.status).toBe(500);
  });
});

describe("DELETE /api/admin/share-link", () => {
  it("idを指定した場合は該当のリンクのみ削除する", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());
    prismaMock.sharedLinkUrl.delete.mockResolvedValue({} as any);

    const res = await DELETE(jsonRequest("http://test", { id: "link-1" }, { method: "DELETE" }));

    expect(prismaMock.sharedLinkUrl.delete).toHaveBeenCalledWith({ where: { id: "link-1" } });
    expect(prismaMock.sharedLinkUrl.findMany).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it("idを指定しない場合はcompanyId内の期限切れリンクを検索する", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());
    prismaMock.sharedLinkUrl.findMany.mockResolvedValue([]);

    const res = await DELETE(jsonRequest("http://test", {}, { method: "DELETE" }));

    expect(prismaMock.sharedLinkUrl.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { companyId: "company-1" } })
    );
    expect(res.status).toBe(200);
  });

  it("期限切れのリンクは実際に削除される", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());
    prismaMock.sharedLinkUrl.findMany.mockResolvedValue([
      { id: "expired-1", expiresAt: "2000-01-01" },
    ] as any);
    prismaMock.sharedLinkUrl.delete.mockResolvedValue({} as any);

    await DELETE(jsonRequest("http://test", {}, { method: "DELETE" }));

    expect(prismaMock.sharedLinkUrl.delete).toHaveBeenCalledWith({ where: { id: "expired-1" } });
  });

  it("期限内のリンクは削除されない", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());
    prismaMock.sharedLinkUrl.findMany.mockResolvedValue([
      { id: "future-1", expiresAt: "2999-01-01" },
    ] as any);

    await DELETE(jsonRequest("http://test", {}, { method: "DELETE" }));

    expect(prismaMock.sharedLinkUrl.delete).not.toHaveBeenCalled();
  });
});
