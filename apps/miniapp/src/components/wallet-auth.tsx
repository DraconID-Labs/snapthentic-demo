import { MiniKit } from "@worldcoin/minikit-js";
import { signIn } from "next-auth/react";
import { getNewNonces } from "~/utils/get-nonces";

export async function loginWithWallet() {
  const { nonce, signedNonce } = await getNewNonces();
  console.dir({ nonce, signedNonce });

  const result = await MiniKit.commandsAsync.walletAuth({
    nonce,
    expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    notBefore: new Date(Date.now() - 24 * 60 * 60 * 1000),
    statement: `Authenticate (${crypto.randomUUID().replace(/-/g, "")}).`,
  });
  if (!result) {
    throw new Error("No response from wallet auth");
  }

  if (result.finalPayload.status !== "success") {
    console.error(
      "Wallet authentication failed",
      result.finalPayload.error_code,
    );
    return;
  }

  await signIn("credentials", {
    redirectTo: "/feed",
    nonce,
    signedNonce,
    finalPayloadJson: JSON.stringify(result.finalPayload),
  });
}
