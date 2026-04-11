import crypto from "node:crypto";

function getEncryptionSecret() {
  const raw = process.env.DATA_ENCRYPTION_KEY || process.env.SESSION_SECRET || "";
  if (!raw) {
    throw new Error("DATA_ENCRYPTION_KEY or SESSION_SECRET is required");
  }
  return crypto.createHash("sha256").update(raw).digest();
}

export function encryptText(plainText) {
  const iv = crypto.randomBytes(12);
  const key = getEncryptionSecret();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

export function decryptText(payload) {
  const raw = Buffer.from(String(payload), "base64url");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const encrypted = raw.subarray(28);
  const key = getEncryptionSecret();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}
