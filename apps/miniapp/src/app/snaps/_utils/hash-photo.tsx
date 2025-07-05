export async function hashMessage(message: string): Promise<string> {
  const buff = new TextEncoder().encode(message);

  const hashBuff = await crypto.subtle.digest("SHA-256", buff);

  const hashArray = Array.from(new Uint8Array(hashBuff));

  return `0x${hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}
