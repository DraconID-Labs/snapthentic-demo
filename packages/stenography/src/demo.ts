#!/usr/bin/env node

import {
  createSampleImage,
  encodeMessage,
  decodeMessage,
  calculateCapacity,
  compareImages,
  imageToBuffer,
} from "./index.js";
import * as fs from "node:fs";

async function demo() {
  console.log("🔐 LSB Steganography Demo\n");

  try {
    // Step 1: Create a sample image
    console.log("Step 1: Creating sample image...");
    const image = await createSampleImage(600, 400);
    const imageBuffer = await imageToBuffer(image);

    // Save for inspection
    await fs.promises.writeFile("demo-original.png", imageBuffer);
    console.log("✓ Saved demo-original.png");

    // Step 2: Calculate capacity
    const capacity = calculateCapacity(600, 400);
    console.log(`✓ Image capacity: ${capacity} bytes\n`);

    // Step 3: Prepare secret message
    const secretMessage =
      "Hello, this is a secret message hidden in the image using LSB steganography!";
    console.log("Step 2: Hiding message...");
    console.log(`Message: "${secretMessage}"`);
    console.log(`Length: ${secretMessage.length} bytes\n`);

    // Step 4: Encode the message
    console.log("Step 3: Encoding message into image...");
    const encodingResult = await encodeMessage(imageBuffer, secretMessage);

    console.log("✓ Encoding successful!");
    console.log(`  - Capacity: ${encodingResult.capacity} bytes`);
    console.log(`  - Used: ${encodingResult.bytesUsed} bytes`);
    console.log(
      `  - Efficiency: ${(encodingResult.efficiency * 100).toFixed(2)}%\n`,
    );

    // Step 5: Save modified image
    const modifiedBuffer = await imageToBuffer(encodingResult.image);
    await fs.promises.writeFile("demo-modified.png", modifiedBuffer);
    console.log("✓ Saved demo-modified.png");

    // Step 6: Decode the message
    console.log("\nStep 4: Decoding hidden message...");
    const decodingResult = await decodeMessage(modifiedBuffer);

    console.log("✓ Decoding successful!");
    console.log(`  - Extracted message: "${decodingResult.message}"`);
    console.log(`  - Bytes read: ${decodingResult.bytesRead}\n`);

    // Step 7: Verify integrity
    const isCorrect = decodingResult.message === secretMessage;
    console.log(
      `Step 5: Verification... ${isCorrect ? "✅ PASSED" : "❌ FAILED"}\n`,
    );

    // Step 8: Image quality analysis
    console.log("Step 6: Analyzing image quality...");
    const comparison = await compareImages(imageBuffer, modifiedBuffer);

    console.log("✓ Quality metrics:");
    console.log(`  - MSE: ${comparison.mse.toFixed(6)}`);
    console.log(`  - PSNR: ${comparison.psnr.toFixed(2)} dB`);
    console.log(`  - Max pixel difference: ${comparison.maxDifference}`);

    // Interpretation
    if (comparison.psnr > 50) {
      console.log("  - Quality: Excellent (virtually imperceptible changes)");
    } else if (comparison.psnr > 40) {
      console.log("  - Quality: Very good (minor changes)");
    } else if (comparison.psnr > 30) {
      console.log("  - Quality: Good (noticeable but acceptable changes)");
    } else {
      console.log("  - Quality: Poor (significant visible changes)");
    }

    console.log("\n🎉 Demo completed successfully!");
    console.log("\nGenerated files:");
    console.log("  - demo-original.png (original image)");
    console.log("  - demo-modified.png (image with hidden message)");
    console.log(
      "\nTry opening both images and see if you can spot the difference!",
    );
  } catch (error) {
    console.error("❌ Demo failed:", error);
    process.exit(1);
  }
}

// Run the demo
demo();
