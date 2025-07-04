import { decodeMessage, imageToBuffer } from "./index.js";
import Jimp from "jimp";

/**
 * Basic example: Hide and extract a simple message
 */
export async function read(): Promise<void> {
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const imagePath = process.argv[2]!;
  console.log("🔐 LSB Steganography Read\n");

  // Create a sample image
  const image = await Jimp.read(imagePath);
  const originalBuffer = await imageToBuffer(image);

  // Decode the message
  const decodingResult = await decodeMessage(originalBuffer);
  console.log(`✓ Message decoded: "${decodingResult.message}"`);
  console.log(`✓ Bytes read: ${decodingResult.bytesRead}`);
}

read();
