import * as fs from "node:fs";
import {
  encodeMessage,
  decodeMessage,
  calculateCapacity,
  createSampleImage,
  compareImages,
  imageToBuffer,
  type SteganographyOptions,
  stripPrefix,
  prefixSignature,
} from "./index.js";

/**
 * Basic example: Hide and extract a simple message
 */
export async function basicExample(): Promise<void> {
  console.log("=== Basic LSB Steganography Example ===\n");

  // Create a sample image
  const image = await createSampleImage(400, 300);
  const originalBuffer = await imageToBuffer(image);

  // Save original image
  await fs.promises.writeFile("original.png", originalBuffer);
  console.log("✓ Created sample image (400x300): original.png");

  // Calculate capacity
  const capacity = calculateCapacity(400, 300);
  console.log(`✓ Image capacity: ${capacity} bytes`);

  // Message to hide
  const secret = "This is a secret message hidden using LSB steganography!";
  console.log(`✓ Message to hide: "${secret}" (${secret.length} bytes)`);

  // Encode the message
  const encodingResult = await encodeMessage(originalBuffer, secret);
  console.log("✓ Message encoded successfully");
  console.log(`  - Capacity: ${encodingResult.capacity} bytes`);
  console.log(`  - Used: ${encodingResult.bytesUsed} bytes`);
  console.log(
    `  - Efficiency: ${(encodingResult.efficiency * 100).toFixed(2)}%`,
  );

  // Save the modified image
  const modifiedBuffer = await imageToBuffer(encodingResult.image);
  await fs.promises.writeFile("modified.png", modifiedBuffer);
  console.log("✓ Saved modified image: modified.png");

  // Decode the message
  const decodingResult = await decodeMessage(modifiedBuffer);
  console.log(`✓ Message decoded: "${decodingResult.message}"`);
  console.log(`✓ Bytes read: ${decodingResult.bytesRead}`);

  // Compare images
  const comparison = await compareImages(originalBuffer, modifiedBuffer);
  console.log("\n📊 Image Quality Metrics:");
  console.log(`  - MSE (Mean Squared Error): ${comparison.mse.toFixed(4)}`);
  console.log(
    `  - PSNR (Peak Signal-to-Noise Ratio): ${comparison.psnr.toFixed(2)} dB`,
  );
  console.log(`  - Max pixel difference: ${comparison.maxDifference}`);

  // Verify the message matches
  if (decodingResult.message === secret) {
    console.log("\n✅ SUCCESS: Message encoded and decoded correctly!");
  } else {
    console.log("\n❌ ERROR: Decoded message does not match original!");
  }
}

/**
 * Advanced example: Using different steganography options
 */
export async function advancedExample(): Promise<void> {
  console.log("\n=== Advanced LSB Steganography Example ===\n");

  const image = await createSampleImage(600, 400);
  const imageBuffer = await imageToBuffer(image);

  const message = "Advanced steganography with custom options! 🔐";

  // Example 1: Using 2 bits per channel for higher capacity
  console.log("1. Using 2 bits per channel:");
  const options1: SteganographyOptions = {
    bitsPerChannel: 2,
    channels: "rgb",
    includeHeader: true,
  };

  const capacity1 = calculateCapacity(600, 400, options1);
  console.log(`   Capacity: ${capacity1} bytes`);

  const result1 = await encodeMessage(imageBuffer, message, options1);
  const buffer1 = await imageToBuffer(result1.image);
  const decoded1 = await decodeMessage(buffer1, options1);
  console.log(
    `   Encoded/Decoded: ${decoded1.message === message ? "✅" : "❌"}`,
  );

  // Example 2: Using RGBA channels
  console.log("\n2. Using RGBA channels:");
  const options2: SteganographyOptions = {
    bitsPerChannel: 1,
    channels: "rgba",
    includeHeader: true,
  };

  const capacity2 = calculateCapacity(600, 400, options2);
  console.log(`   Capacity: ${capacity2} bytes`);

  const result2 = await encodeMessage(imageBuffer, message, options2);
  const buffer2 = await imageToBuffer(result2.image);
  const decoded2 = await decodeMessage(buffer2, options2);
  console.log(
    `   Encoded/Decoded: ${decoded2.message === message ? "✅" : "❌"}`,
  );

  // Example 3: Without header (fixed-length message)
  console.log("\n3. Without header (less reliable):");
  const options3: SteganographyOptions = {
    bitsPerChannel: 1,
    channels: "rgb",
    includeHeader: false,
  };

  const capacity3 = calculateCapacity(600, 400, options3);
  console.log(`   Capacity: ${capacity3} bytes`);

  const result3 = await encodeMessage(imageBuffer, message, options3);
  const buffer3 = await imageToBuffer(result3.image);
  const decoded3 = await decodeMessage(buffer3, options3);
  console.log(
    `   Encoded/Decoded: ${decoded3.message.trim() === message ? "✅" : "❌"}`,
  );

  // Compare image quality for different bit depths
  console.log("\n📊 Quality comparison:");
  const comp1 = await compareImages(imageBuffer, buffer1);
  const comp2 = await compareImages(imageBuffer, buffer2);

  console.log(
    `   2-bit LSB - PSNR: ${comp1.psnr.toFixed(2)} dB, Max diff: ${comp1.maxDifference}`,
  );
  console.log(
    `   1-bit RGBA - PSNR: ${comp2.psnr.toFixed(2)} dB, Max diff: ${comp2.maxDifference}`,
  );
}

/**
 * Example: Hiding structured data (JSON)
 */
export async function structuredDataExample(): Promise<void> {
  console.log("\n=== Structured Data Example ===\n");

  const image = await createSampleImage(500, 400);
  const imageBuffer = await imageToBuffer(image);

  // Create structured data
  const userData = {
    id: "12345",
    name: "John Doe",
    email: "john@example.com",
    timestamp: new Date().toISOString(),
    signature: "digital_signature_here",
    metadata: {
      version: "1.0",
      algorithm: "LSB-RGB",
    },
  };

  // Serialize to JSON and add signature prefix
  const jsonData = JSON.stringify(userData, null, 2);
  const signedData = prefixSignature(jsonData);

  console.log(`✓ Data to hide: ${signedData.length} bytes`);
  console.log(`✓ First 100 chars: ${signedData.substring(0, 100)}...`);

  // Check capacity
  const capacity = calculateCapacity(500, 400);
  console.log(`✓ Image capacity: ${capacity} bytes`);

  if (signedData.length > capacity) {
    console.log(
      `❌ Data too large! Need ${signedData.length - capacity} more bytes`,
    );
    return;
  }

  // Encode
  const result = await encodeMessage(imageBuffer, signedData);
  console.log(
    `✓ Encoded ${result.bytesUsed} bytes (${(result.efficiency * 100).toFixed(1)}% efficiency)`,
  );

  // Decode
  const modifiedBuffer = await imageToBuffer(result.image);
  const decoded = await decodeMessage(modifiedBuffer);
  const extractedData = stripPrefix(decoded.message);

  try {
    const parsedData = JSON.parse(extractedData);
    console.log("✅ Successfully decoded and parsed JSON data:");
    console.log(`   ID: ${parsedData.id}`);
    console.log(`   Name: ${parsedData.name}`);
    console.log(`   Email: ${parsedData.email}`);
    console.log(`   Timestamp: ${parsedData.timestamp}`);
  } catch (error) {
    console.log("❌ Failed to parse decoded JSON data");
  }
}

/**
 * Example: Capacity analysis for different image sizes
 */
export async function capacityAnalysisExample(): Promise<void> {
  console.log("\n=== Capacity Analysis Example ===\n");

  const imageSizes = [
    { width: 100, height: 100, name: "Tiny" },
    { width: 400, height: 300, name: "Small" },
    { width: 800, height: 600, name: "Medium" },
    { width: 1200, height: 800, name: "Large" },
    { width: 1920, height: 1080, name: "HD" },
  ];

  console.log("Image Size Analysis (1-bit LSB, RGB channels):");
  console.log("================================================");

  for (const size of imageSizes) {
    const capacity = calculateCapacity(size.width, size.height);
    const pixels = size.width * size.height;

    console.log(
      `${size.name.padEnd(8)} (${size.width}x${size.height}): ${capacity.toLocaleString()} bytes, ${pixels.toLocaleString()} pixels`,
    );
  }

  console.log("\nCapacity with different configurations:");
  console.log("=======================================");

  const testSize = { width: 800, height: 600 };
  const configurations = [
    { bitsPerChannel: 1, channels: "rgb" as const, name: "1-bit RGB" },
    { bitsPerChannel: 2, channels: "rgb" as const, name: "2-bit RGB" },
    { bitsPerChannel: 1, channels: "rgba" as const, name: "1-bit RGBA" },
    { bitsPerChannel: 2, channels: "rgba" as const, name: "2-bit RGBA" },
  ];

  for (const config of configurations) {
    const capacity = calculateCapacity(testSize.width, testSize.height, config);
    console.log(
      `${config.name.padEnd(12)}: ${capacity.toLocaleString()} bytes`,
    );
  }
}

/**
 * Performance benchmark example
 */
export async function performanceExample(): Promise<void> {
  console.log("\n=== Performance Benchmark Example ===\n");

  const sizes = [
    { width: 400, height: 300, name: "Small" },
    { width: 800, height: 600, name: "Medium" },
  ];

  for (const size of sizes) {
    console.log(`Testing ${size.name} image (${size.width}x${size.height}):`);

    const image = await createSampleImage(size.width, size.height);
    const imageBuffer = await imageToBuffer(image);
    const message = "Performance test message ".repeat(50); // ~1250 bytes

    // Encoding benchmark
    const encodeStart = Date.now();
    const result = await encodeMessage(imageBuffer, message);
    const encodeTime = Date.now() - encodeStart;

    // Decoding benchmark
    const modifiedBuffer = await imageToBuffer(result.image);
    const decodeStart = Date.now();
    const decoded = await decodeMessage(modifiedBuffer);
    const decodeTime = Date.now() - decodeStart;

    console.log(`  Encoding: ${encodeTime}ms`);
    console.log(`  Decoding: ${decodeTime}ms`);
    console.log(
      `  Message verified: ${decoded.message === message ? "✅" : "❌"}`,
    );
    console.log();
  }
}

/**
 * Run all examples
 */
export async function runAllExamples(): Promise<void> {
  try {
    await basicExample();
    await advancedExample();
    await structuredDataExample();
    await capacityAnalysisExample();
    await performanceExample();

    console.log("\n🎉 All examples completed successfully!");

    // Cleanup
    const filesToClean = ["original.png", "modified.png"];
    for (const file of filesToClean) {
      try {
        await fs.promises.unlink(file);
      } catch (error) {
        // File might not exist, ignore
      }
    }
  } catch (error) {
    console.error("❌ Error running examples:", error);
  }
}

runAllExamples();
