import { describe, it, expect, vi } from "vitest";
import { prismaMock } from "@test/mockPrisma";
import { makeSession, jsonRequest } from "@test/helpers";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/require", () => ({ requireSession: vi.fn() }));

import { requireSession } from "@/lib/auth/require";
import { POST, PUT } from "./route";

const VALID_PROJECT = {
  name: "案件A",
  periodFrom: "2024-01-01",
  periodTo: "",
  projectJson: { description: "内容", role: "アプリケーション", phases: ["実装"] },
  skillsJson: { languages: [], frameworks: [], databases: [], cloud: [], tools: [] },
};

describe("POST /api/projects", () => {
  it("バリデーションエラーなら400", async () => {
    vi.mocked(requireSession).mockResolvedValue(makeSession());

    const res = await POST(jsonRequest("http://test", { ...VALID_PROJECT, name: "" }));
    expect(res.status).toBe(400);
    expect(prismaMock.skillProject.create).not.toHaveBeenCalled();
  });

  it("既存のSkillSheetがあればそれを使い、companyIdスコープで案件を作成する", async () => {
    vi.mocked(requireSession).mockResolvedValue(makeSession());
    prismaMock.skillSheet.findFirst.mockResolvedValue({ id: "sheet-1" } as any);
    prismaMock.skillProject.create.mockResolvedValue({ id: "proj-1" } as any);
    prismaMock.skillSheet.update.mockResolvedValue({} as any);

    const res = await POST(jsonRequest("http://test", VALID_PROJECT));

    expect(prismaMock.skillSheet.findFirst).toHaveBeenCalledWith({
      where: { userId: "user-1", companyId: "company-1" },
    });
    expect(prismaMock.skillSheet.create).not.toHaveBeenCalled();
    expect(prismaMock.skillProject.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ skillSheetId: "sheet-1", companyId: "company-1" }),
      })
    );
    expect(res.status).toBe(200);
  });

  it("SkillSheetが無ければ作成してから案件を作成する", async () => {
    vi.mocked(requireSession).mockResolvedValue(makeSession());
    prismaMock.skillSheet.findFirst.mockResolvedValue(null);
    prismaMock.skillSheet.create.mockResolvedValue({ id: "new-sheet" } as any);
    prismaMock.skillProject.create.mockResolvedValue({ id: "proj-1" } as any);
    prismaMock.skillSheet.update.mockResolvedValue({} as any);

    await POST(jsonRequest("http://test", VALID_PROJECT));

    expect(prismaMock.skillSheet.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { userId: "user-1", companyId: "company-1" } })
    );
  });
});

describe("PUT /api/projects", () => {
  it("id未指定なら400", async () => {
    vi.mocked(requireSession).mockResolvedValue(makeSession());

    const res = await PUT(jsonRequest("http://test", VALID_PROJECT, { method: "PUT" }));
    expect(res.status).toBe(400);
  });

  it("他社/他ユーザーの案件は404", async () => {
    vi.mocked(requireSession).mockResolvedValue(makeSession());
    prismaMock.skillProject.findFirst.mockResolvedValue(null);

    const res = await PUT(jsonRequest("http://test", { ...VALID_PROJECT, id: "proj-1" }, { method: "PUT" }));

    expect(prismaMock.skillProject.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "proj-1", companyId: "company-1", skillSheet: { userId: "user-1" } },
      })
    );
    expect(res.status).toBe(404);
    expect(prismaMock.skillProject.updateMany).not.toHaveBeenCalled();
  });

  it("所有権があればcompanyIdスコープで更新する", async () => {
    vi.mocked(requireSession).mockResolvedValue(makeSession());
    prismaMock.skillProject.findFirst.mockResolvedValue({ id: "proj-1", skillSheetId: "sheet-1" } as any);
    prismaMock.skillProject.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.skillSheet.update.mockResolvedValue({} as any);

    const res = await PUT(jsonRequest("http://test", { ...VALID_PROJECT, id: "proj-1" }, { method: "PUT" }));

    expect(prismaMock.skillProject.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "proj-1", companyId: "company-1" } })
    );
    expect(res.status).toBe(200);
  });
});
