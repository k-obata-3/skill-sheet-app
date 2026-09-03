import { describe, it, expect, vi } from "vitest";
import { prismaMock } from "@test/mockPrisma";
import { makeSession, jsonRequest } from "@test/helpers";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/require", () => ({ requireSession: vi.fn() }));

import { requireSession } from "@/lib/auth/require";
import { PUT } from "./route";

describe("PUT /api/skill-sheet", () => {
  it("summaryが空なら400", async () => {
    vi.mocked(requireSession).mockResolvedValue(makeSession());

    const res = await PUT(jsonRequest("http://test", { summary: "", remarks: "" }, { method: "PUT" }));
    expect(res.status).toBe(400);
  });

  it("summaryが500文字を超えると400", async () => {
    vi.mocked(requireSession).mockResolvedValue(makeSession());

    const res = await PUT(
      jsonRequest("http://test", { summary: "あ".repeat(501) }, { method: "PUT" })
    );
    expect(res.status).toBe(400);
  });

  it("remarksが300文字を超えると400", async () => {
    vi.mocked(requireSession).mockResolvedValue(makeSession());

    const res = await PUT(
      jsonRequest("http://test", { summary: "自己PR", remarks: "あ".repeat(301) }, { method: "PUT" })
    );
    expect(res.status).toBe(400);
  });

  it("既存のSkillSheetがあればcompanyId/userIdで絞り込みupdateする", async () => {
    vi.mocked(requireSession).mockResolvedValue(makeSession());
    prismaMock.skillSheet.findFirst.mockResolvedValue({ id: "sheet-1" } as any);
    prismaMock.skillSheet.update.mockResolvedValue({} as any);

    const res = await PUT(jsonRequest("http://test", { summary: "自己PR", remarks: "備考" }, { method: "PUT" }));

    expect(prismaMock.skillSheet.findFirst).toHaveBeenCalledWith({
      where: { userId: "user-1", companyId: "company-1" },
    });
    expect(prismaMock.skillSheet.update).toHaveBeenCalledWith({
      where: { id: "sheet-1" },
      data: { summary: "自己PR", remarks: "備考" },
    });
    expect(prismaMock.skillSheet.create).not.toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it("既存のSkillSheetが無ければcreateする", async () => {
    vi.mocked(requireSession).mockResolvedValue(makeSession());
    prismaMock.skillSheet.findFirst.mockResolvedValue(null);
    prismaMock.skillSheet.create.mockResolvedValue({} as any);

    await PUT(jsonRequest("http://test", { summary: "自己PR" }, { method: "PUT" }));

    expect(prismaMock.skillSheet.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: "user-1", companyId: "company-1" }) })
    );
  });
});
