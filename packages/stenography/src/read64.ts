import { base64ToBuffer, decodeMessage, splitPrefix } from "./index.js";
import fs from "node:fs";

/**
 * Basic example: Hide and extract a simple message
 */
export async function read64(): Promise<void> {
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const imagePath = process.argv[2]!;
  console.log("🔐 LSB Steganography Read\n");

  const file = fs.readFileSync(imagePath, "ascii");
  console.log(file.slice(0, 30));
  const [prefix, data] = splitPrefix(file);

  console.log(prefix);
  console.log();

  const buffer = base64ToBuffer(data);

  // Decode the message
  const decodingResult = await decodeMessage(buffer);
  console.log(`✓ Message decoded: "${decodingResult.message}"`);
  // console.log(`✓ Bytes read: ${decodingResult.bytesRead}`);
}

read64();
