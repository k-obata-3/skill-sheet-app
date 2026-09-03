import { describe, it, expect, vi } from "vitest";
import { prismaMock } from "@test/mockPrisma";
import { makeSession, jsonRequest } from "@test/helpers";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/require", () => ({ requireAdmin: vi.fn() }));

import { requireAdmin } from "@/lib/auth/require";
import { POST } from "./route";

describe("POST /api/admin/skill-master", () => {
  it("バリデーションエラーなら400", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());

    const res = await POST(jsonRequest("http://test", { category: "INVALID", name: "" }));
    expect(res.status).toBe(400);
  });

  it("companyIdを付与して作成する", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());
    prismaMock.skillMaster.create.mockResolvedValue({ id: "sm1" } as any);

    const res = await POST(jsonRequest("http://test", { category: "LANGUAGE", name: "Rust" }));

    expect(prismaMock.skillMaster.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { companyId: "company-1", category: "LANGUAGE", name: "Rust" } })
    );
    expect(res.status).toBe(200);
  });

  it("一意制約違反（P2002）なら重複メッセージで400", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());
    prismaMock.skillMaster.create.mockRejectedValue({ code: "P2002" });

    const res = await POST(jsonRequest("http://test", { category: "LANGUAGE", name: "Rust" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toContain("既に登録されています");
  });

  it("P2002以外の例外なら汎用メッセージで500", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(makeSession());
    prismaMock.skillMaster.create.mockRejectedValue(new Error("boom"));

    const res = await POST(jsonRequest("http://test", { category: "LANGUAGE", name: "Rust" }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.message).toBe("作成に失敗しました");
  });
});
