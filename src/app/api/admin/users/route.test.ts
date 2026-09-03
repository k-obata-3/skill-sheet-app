import { describe, it, expect, vi } from "vitest";
import { prismaMock } from "@test/mockPrisma";
import { makeSession, jsonRequest } from "@test/helpers";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/require", () => ({ requireAdmin: vi.fn() }));

import { requireAdmin } from "@/lib/auth/require";
import { GET, POST } from "./route";

describe("GET /api/admin/users", () => {
  it("companyIdでスコープして一覧を返す", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());
    prismaMock.user.findMany.mockResolvedValue([]);

    const res = await GET();

    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { companyId: "company-1" } })
    );
    expect(res.status).toBe(200);
  });
});

describe("POST /api/admin/users", () => {
  it("バリデーションエラーなら400", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());

    const res = await POST(jsonRequest("http://test", { email: "invalid", name: "", role: "MEMBER" }));
    expect(res.status).toBe(400);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("companyIdを付与し、isActive:falseで作成する", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());
    prismaMock.user.create.mockResolvedValue({ id: "u1" } as any);

    const res = await POST(
      jsonRequest("http://test", { email: "new@example.com", name: "新規", role: "MEMBER" })
    );

    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          companyId: "company-1",
          email: "new@example.com",
          isActive: false,
        }),
      })
    );
    expect(res.status).toBe(200);
  });
});
