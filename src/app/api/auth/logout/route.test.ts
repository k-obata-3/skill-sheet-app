import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/auth/session", () => ({ clearSession: vi.fn() }));

import { clearSession } from "@/lib/auth/session";
import { POST } from "./route";

describe("POST /api/auth/logout", () => {
  it("clearSessionをawaitして呼び、ok:trueを返す", async () => {
    const res = await POST();

    expect(clearSession).toHaveBeenCalled();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
  });
});
