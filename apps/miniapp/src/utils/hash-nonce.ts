import crypto from "node:crypto";
import { env } from "~/env";

export function hashNonce({ nonce }: { nonce: string }) {
  const hmac = crypto.createHmac("sha256", env.NEXTAUTH_SECRET);
  hmac.update(nonce);
  return hmac.digest("hex");
}
