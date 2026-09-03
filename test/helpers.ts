import { Role } from "@prisma/client";
import type { SessionPayload } from "@/lib/auth/session";

export function makeSession(overrides: Partial<SessionPayload> = {}): SessionPayload {
  return {
    userId: "user-1",
    companyId: "company-1",
    role: Role.ADMIN,
    ...overrides,
  };
}

export function jsonRequest(url: string, body?: unknown, init?: RequestInit): Request {
  const { method = "POST", headers, ...rest } = init ?? {};
  return new Request(url, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });
}

export function params<T extends object>(p: T): { params: Promise<T> } {
  return { params: Promise.resolve(p) };
}
