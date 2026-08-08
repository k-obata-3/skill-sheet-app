import { Role } from "@prisma/client";
import { getSession } from "./session";

export async function requireSession() {
  const s = await getSession();
  if (!s) {
    throw new Error("UNAUTHORIZED");
  }

  return s;
}

export async function requireAdmin() {
  const s = await requireSession();
  if (!(s.role === Role.OWNER || s.role === Role.ADMIN)) {
    throw new Error("FORBIDDEN");
  }

  return s;
}

export function canReadOtherUsers(role: Role) {
  return role === Role.OWNER || role === Role.ADMIN;
}
