#!/usr/bin/env node

import Jimp from "jimp";
import {
  encodeMessage,
  calculateCapacity,
  imageToBuffer,
  prefixSignature,
} from "./index.js";
import * as fs from "node:fs";

async function write() {
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const imagePath = process.argv[2]!;
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const message = process.argv[3]!;
  console.log("🔐 LSB Steganography Write\n");

  try {
    // Step 1: Create a sample image
    console.log("Step 1: Creating sample image...");
    const image = await Jimp.read(imagePath);
    const imageBuffer = await imageToBuffer(image);

    // Step 2: Calculate capacity
    const capacity = calculateCapacity(image.getWidth(), image.getHeight());

    console.log(`✓ Image capacity: ${capacity} bytes\n`);

    // Step 3: Prepare secret message
    console.log("Step 2: Hiding message...");
    console.log(`Message: "${message}"`);
    console.log(`Length: ${message.length} bytes\n`);

    // Step 4: Encode the message
    console.log("Step 3: Encoding message into image...");
    const encodingResult = await encodeMessage(
      imageBuffer,
      prefixSignature(message),
    );

    console.log("✓ Encoding successful!");
    console.log(`  - Capacity: ${encodingResult.capacity} bytes`);
    console.log(`  - Used: ${encodingResult.bytesUsed} bytes`);
    console.log(
      `  - Efficiency: ${(encodingResult.efficiency * 100).toFixed(2)}%\n`,
    );

    // Step 5: Save modified image
    const modifiedBuffer = await imageToBuffer(encodingResult.image);
    await fs.promises.writeFile(`encoded.${imagePath}`, modifiedBuffer);
    console.log("✓ Saved modified image");
  } catch (error) {
    console.error("❌ Demo failed:", error);
    process.exit(1);
  }
}

// Run the demo
write();
