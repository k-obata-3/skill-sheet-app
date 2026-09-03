import { describe, it, expect, vi, afterEach } from "vitest";
import { prismaMock } from "@test/mockPrisma";
import { jsonRequest } from "@test/helpers";

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("bcryptjs", () => ({ hash: vi.fn().mockResolvedValue("hashed") }));

import { POST } from "./route";

const VALID_BODY = {
  companyName: "テスト株式会社",
  ownerName: "山田太郎",
  ownerEmail: "owner@example.com",
  password: "password123",
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("POST /api/public/register-company", () => {
  it("本番環境では404を返しDBに触れない", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const res = await POST(jsonRequest("http://test", VALID_BODY));
    expect(res.status).toBe(404);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("入力不足なら400", async () => {
    const res = await POST(jsonRequest("http://test", { ...VALID_BODY, companyName: "" }));
    expect(res.status).toBe(400);
  });

  it("パスワードが8文字未満なら400", async () => {
    const res = await POST(jsonRequest("http://test", { ...VALID_BODY, password: "short" }));
    expect(res.status).toBe(400);
  });

  it("メール形式が不正なら400", async () => {
    const res = await POST(jsonRequest("http://test", { ...VALID_BODY, ownerEmail: "invalid" }));
    expect(res.status).toBe(400);
  });

  it("会社名/管理者名が200文字を超えると400", async () => {
    const res = await POST(jsonRequest("http://test", { ...VALID_BODY, companyName: "あ".repeat(201) }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe("入力が長すぎます。");
  });

  it("成功時はCompanyとOWNERユーザーをトランザクション内で作成する", async () => {
    prismaMock.$transaction.mockImplementation(async (fn: any) => fn(prismaMock));
    prismaMock.company.create.mockResolvedValue({ id: "company-x" } as any);
    prismaMock.user.create.mockResolvedValue({ id: "user-x", companyId: "company-x" } as any);

    const res = await POST(jsonRequest("http://test", VALID_BODY));

    expect(prismaMock.company.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { name: "テスト株式会社" } })
    );
    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ companyId: "company-x", role: "OWNER", passwordHash: "hashed" }),
      })
    );
    expect(res.status).toBe(200);
  });

  it("Prismaが例外を投げた場合は500", async () => {
    prismaMock.$transaction.mockRejectedValue(new Error("boom"));

    const res = await POST(jsonRequest("http://test", VALID_BODY));
    expect(res.status).toBe(500);
  });
});
