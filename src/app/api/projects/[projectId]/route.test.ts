import { describe, it, expect, vi } from "vitest";
import { prismaMock } from "@test/mockPrisma";
import { makeSession, jsonRequest, params } from "@test/helpers";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/require", () => ({ requireSession: vi.fn() }));

import { requireSession } from "@/lib/auth/require";
import { DELETE } from "./route";

describe("DELETE /api/projects/[projectId]", () => {
  it("所有権チェック後、companyIdスコープで削除する", async () => {
    vi.mocked(requireSession).mockResolvedValue(makeSession());
    prismaMock.skillProject.findFirst.mockResolvedValue({ id: "proj-1" } as any);
    prismaMock.skillProject.delete.mockResolvedValue({} as any);
    prismaMock.skillSheet.update.mockResolvedValue({} as any);

    const res = await DELETE(
      jsonRequest("http://test", undefined, { method: "DELETE" }),
      params({ projectId: "proj-1" })
    );

    expect(prismaMock.skillProject.findFirst).toHaveBeenCalledWith({
      where: { id: "proj-1", companyId: "company-1", skillSheet: { userId: "user-1" } },
    });
    expect(prismaMock.skillProject.delete).toHaveBeenCalledWith({ where: { id: "proj-1" } });
    expect(res.status).toBe(200);
  });

  it("他社/他ユーザーの案件は削除せずok:trueを返す（早期return）", async () => {
    vi.mocked(requireSession).mockResolvedValue(makeSession());
    prismaMock.skillProject.findFirst.mockResolvedValue(null);

    const res = await DELETE(
      jsonRequest("http://test", undefined, { method: "DELETE" }),
      params({ projectId: "other" })
    );

    expect(prismaMock.skillProject.delete).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
  });
});
