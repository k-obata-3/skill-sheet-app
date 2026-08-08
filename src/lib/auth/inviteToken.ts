import crypto from "crypto";

export function generateToken(bytes = 32) {
  // URLに載せる生トークン（base64url）
  return crypto.randomBytes(bytes).toString("base64url");
}

export function hashToken(token: string) {
  // DB保存用（平文保存しない）
  return crypto.createHash("sha256").update(token).digest("hex");
}
