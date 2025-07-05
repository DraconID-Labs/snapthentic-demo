import z from "zod";
import Safe, { hashSafeMessage } from "@safe-global/protocol-kit";

const HexString = (length: number) =>
  z.string().regex(new RegExp(`^0x[0-9a-fA-F]{${length}}$`));

export const SignaturePayloadV1 = z.object({
  signerAddress: HexString(40),
  hash: HexString(64),
  signature: HexString(130),
  txHash: HexString(64),
});
export type SignaturePayloadV1 = z.infer<typeof SignaturePayloadV1>;

export const PREFIX = {
  SNAP_HASH: "snapthentic:v1",
};

/**
 * Used in general to prefix a message with a version prefix.
 * Used while signing image hash to add version prefix.
 */
export function prefixSignature(message: string): string {
  return `${PREFIX.SNAP_HASH}:${message}`;
}

export function constructV1Signature({
  signerAddress,
  hash,
  signature,
  txHash,
}: SignaturePayloadV1): string {
  return prefixSignature(`${signerAddress}:${hash}:${signature}:${txHash}`);
}

export function parseV1Signature(sig: string): SignaturePayloadV1 {
  const [brand, version, ...payload] = sig.split(":");
  console.log("brand", brand);
  console.log("version", version);
  console.log("payload", payload);
  const brandAndVersion = `${brand}:${version}`;
  console.log("brandAndVersion", brandAndVersion);
  if (brandAndVersion !== PREFIX.SNAP_HASH) {
    throw new Error("Invalid signature brand and version");
  }

  const [signerAddress, hash, signature, txHash] = payload;

  return SignaturePayloadV1.parse({
    signerAddress,
    hash,
    signature,
    txHash,
  });
}

/**
 * Verifies a signature against an address and hash
 * @param signature - The signature to verify (hex string)
 * @param hash - The hash that was signed (hex string)
 * @param address - The expected signer address (hex string)
 * @returns boolean indicating if the signature is valid
 */
async function verifySignature(
  signature: string,
  hash: string,
  address: string,
): Promise<boolean> {
  try {
    const safe = await Safe.init({
      provider: "https://worldchain-mainnet.g.alchemy.com/public",
      safeAddress: address,
    });
    const message = prefixSignature(hash);
    const safeHash = hashSafeMessage(message);
    const isValid = await safe.isValidSignature(safeHash, signature);

    return isValid;
  } catch (error) {
    console.error("Signature verification failed:", error);
    return false;
  }
}

/**
 * Verifies a V1 signature payload
 * @param payload - The parsed signature payload
 * @returns boolean indicating if the signature is valid
 */
export async function verifyV1Signature(
  payload: Omit<SignaturePayloadV1, "txHash">,
): Promise<boolean> {
  return verifySignature(
    payload.signature,
    payload.hash,
    payload.signerAddress,
  );
}
