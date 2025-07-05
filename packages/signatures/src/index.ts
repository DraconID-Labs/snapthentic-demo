import z from "zod";

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
  SNAP_HASH: "snapthentic:v1:",
};

/**
 * Used in general to prefix a message with a version prefix.
 * Used while signing image hash to add version prefix.
 */
export function prefixSignature(message: string): string {
  return `${PREFIX.SNAP_HASH}${message}`;
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
  const brandAndVersion = `${brand}:${version}`;
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
