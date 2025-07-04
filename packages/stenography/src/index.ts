import Jimp from "jimp";

// Message prefix functions (keeping existing functionality)
export function prefixSignature(message: string): string {
  return `snapthentic:v1:${message}`;
}

export function stripPrefix(signature: string): string {
  return signature.replace(/^snapthentic:v1:/, "");
}

// Types for steganography
export interface SteganographyOptions {
  /** Number of bits to use per color channel (1-8, default: 1 for LSB) */
  bitsPerChannel?: number;
  /** Color channels to use: 'rgb', 'rgba' (default: 'rgb') */
  channels?: "rgb" | "rgba";
  /** Whether to include a header with message length (default: true) */
  includeHeader?: boolean;
}

export interface EncodingResult {
  /** The Jimp image object containing the image with hidden data */
  image: Jimp;
  /** Maximum message capacity in bytes */
  capacity: number;
  /** Actual bytes used for the message */
  bytesUsed: number;
  /** Encoding efficiency (bytesUsed / capacity) */
  efficiency: number;
}

export interface DecodingResult {
  /** The extracted hidden message */
  message: string;
  /** Number of bytes that were read */
  bytesRead: number;
}

export interface ImageComparisonResult {
  mse: number; // Mean Squared Error
  psnr: number; // Peak Signal-to-Noise Ratio
  maxDifference: number;
}

// Utility functions for bit manipulation
function stringToBinary(str: string): string {
  return str
    .split("")
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join("");
}

function binaryToString(binary: string): string {
  const result = [];
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.substr(i, 8);
    if (byte.length === 8) {
      result.push(String.fromCharCode(Number.parseInt(byte, 2)));
    }
  }
  return result.join("");
}

function numberToBinary(num: number, bits: number): string {
  return num.toString(2).padStart(bits, "0");
}

function binaryToNumber(binary: string): number {
  return Number.parseInt(binary, 2);
}

// LSB modification functions
function modifyLSB(value: number, bit: string, bitsPerChannel = 1): number {
  const mask = (1 << bitsPerChannel) - 1; // Create mask for the specified number of bits
  const bitValue = Number.parseInt(
    bit.padEnd(bitsPerChannel, "0").substr(0, bitsPerChannel),
    2,
  );
  return (value & ~mask) | bitValue;
}

function extractLSB(value: number, bitsPerChannel = 1): string {
  const mask = (1 << bitsPerChannel) - 1;
  return (value & mask).toString(2).padStart(bitsPerChannel, "0");
}

/**
 * Calculate the maximum capacity for hiding data in an image
 */
export function calculateCapacity(
  width: number,
  height: number,
  options: SteganographyOptions = {},
): number {
  const {
    bitsPerChannel = 1,
    channels = "rgb",
    includeHeader = true,
  } = options;
  const channelsCount = channels === "rgba" ? 4 : 3;
  const totalPixels = width * height;
  const totalBits = totalPixels * channelsCount * bitsPerChannel;
  const totalBytes = Math.floor(totalBits / 8);

  // Reserve 4 bytes (32 bits) for message length header if enabled
  const headerBytes = includeHeader ? 4 : 0;

  return Math.max(0, totalBytes - headerBytes);
}

/**
 * Encode a message into an image using LSB steganography
 */
export async function encodeMessage(
  imagePath: string | Buffer,
  message: string,
  options: SteganographyOptions = {},
): Promise<EncodingResult> {
  const {
    bitsPerChannel = 1,
    channels = "rgb",
    includeHeader = true,
  } = options;

  if (bitsPerChannel < 1 || bitsPerChannel > 8) {
    throw new Error("bitsPerChannel must be between 1 and 8");
  }

  // Load the image
  // @ts-expect-error - type union
  const image = await Jimp.read(imagePath);

  // Calculate capacity
  const capacity = calculateCapacity(
    image.getWidth(),
    image.getHeight(),
    options,
  );

  if (message.length > capacity) {
    throw new Error(
      `Message too long. Maximum capacity: ${capacity} bytes, message length: ${message.length} bytes`,
    );
  }

  // Prepare the data to hide
  let binaryData = "";

  if (includeHeader) {
    // Add 32-bit header with message length
    binaryData += numberToBinary(message.length, 32);
  }

  // Add the message
  binaryData += stringToBinary(message);

  // Pad to ensure we have enough bits
  const channelsCount = channels === "rgba" ? 4 : 3;
  const maxBits =
    image.getWidth() * image.getHeight() * channelsCount * bitsPerChannel;
  binaryData = binaryData.padEnd(maxBits, "0");

  // Clone the image to avoid modifying the original
  const modifiedImage = image.clone();

  // Hide the data in the image
  let bitIndex = 0;
  modifiedImage.scan(
    0,
    0,
    modifiedImage.getWidth(),
    modifiedImage.getHeight(),
    function (x, y, idx) {
      const channelCount = channels === "rgba" ? 4 : 3;

      for (let channel = 0; channel < channelCount; channel++) {
        if (bitIndex < binaryData.length) {
          const bits = binaryData.substr(bitIndex, bitsPerChannel);
          this.bitmap.data[idx + channel] = modifyLSB(
            // biome-ignore lint/style/noNonNullAssertion: it's there
            this.bitmap.data[idx + channel]!,
            bits,
            bitsPerChannel,
          );
          bitIndex += bitsPerChannel;
        }
      }
    },
  );

  return {
    image: modifiedImage,
    capacity,
    bytesUsed: message.length,
    efficiency: message.length / capacity,
  };
}

/**
 * Decode a hidden message from an image using LSB steganography
 */
export async function decodeMessage(
  imagePath: string | Buffer,
  options: SteganographyOptions = {},
): Promise<DecodingResult> {
  const {
    bitsPerChannel = 1,
    channels = "rgb",
    includeHeader = true,
  } = options;

  if (bitsPerChannel < 1 || bitsPerChannel > 8) {
    throw new Error("bitsPerChannel must be between 1 and 8");
  }

  // Load the image
  // @ts-expect-error - type union
  const image = await Jimp.read(imagePath);

  let extractedBits = "";
  const channelsCount = channels === "rgba" ? 4 : 3;

  // Extract all available bits
  image.scan(0, 0, image.getWidth(), image.getHeight(), function (x, y, idx) {
    for (let channel = 0; channel < channelsCount; channel++) {
      extractedBits += extractLSB(
        // biome-ignore lint/style/noNonNullAssertion: it's there
        this.bitmap.data[idx + channel]!,
        bitsPerChannel,
      );
    }
  });

  let messageLength: number;
  let messageBits: string;

  if (includeHeader) {
    // Extract message length from header (first 32 bits)
    const headerBits = extractedBits.substr(0, 32);
    messageLength = binaryToNumber(headerBits);

    // Extract message bits
    const messageBitsStart = 32;
    const messageBitsEnd = messageBitsStart + messageLength * 8;
    messageBits = extractedBits.substr(
      messageBitsStart,
      messageBitsEnd - messageBitsStart,
    );
  } else {
    // Without header, we need to find the end of the message
    // This is less reliable and requires knowing the message format
    messageBits = extractedBits;
    messageLength = Math.floor(messageBits.length / 8);
  }

  // Convert bits back to string
  const message = binaryToString(messageBits);

  return {
    message: includeHeader ? message : message.replace(/\0+$/, ""), // Remove null terminators if no header
    bytesRead: messageLength,
  };
}

/**
 * Create a sample image with a checkerboard pattern for testing
 */
export async function createSampleImage(
  width = 400,
  height = 300,
): Promise<Jimp> {
  const image = new Jimp(width, height);

  // Create a checkerboard pattern
  const squareSize = 20;
  image.scan(0, 0, width, height, function (x, y, idx) {
    const squareX = Math.floor(x / squareSize);
    const squareY = Math.floor(y / squareSize);
    const isEven = (squareX + squareY) % 2 === 0;

    if (isEven) {
      // White squares
      this.bitmap.data[idx + 0] = 255; // R
      this.bitmap.data[idx + 1] = 255; // G
      this.bitmap.data[idx + 2] = 255; // B
      this.bitmap.data[idx + 3] = 255; // A
    } else {
      // Light gray squares
      this.bitmap.data[idx + 0] = 204; // R
      this.bitmap.data[idx + 1] = 204; // G
      this.bitmap.data[idx + 2] = 204; // B
      this.bitmap.data[idx + 3] = 255; // A
    }
  });

  // Add some color variations for more realistic appearance
  image.scan(50, 50, 100, 100, function (x, y, idx) {
    // biome-ignore lint/style/noNonNullAssertion: it's there
    this.bitmap.data[idx + 0] = Math.min(255, this.bitmap.data[idx + 0]! + 25); // Add red tint
  });

  image.scan(200, 100, 100, 100, function (x, y, idx) {
    // biome-ignore lint/style/noNonNullAssertion: it's there
    this.bitmap.data[idx + 1] = Math.min(255, this.bitmap.data[idx + 1]! + 25); // Add green tint
  });

  image.scan(100, 150, 100, 100, function (x, y, idx) {
    // biome-ignore lint/style/noNonNullAssertion: it's there
    this.bitmap.data[idx + 2] = Math.min(255, this.bitmap.data[idx + 2]! + 25); // Add blue tint
  });

  return image;
}

/**
 * Compare two images and return the difference metrics
 */
export async function compareImages(
  originalPath: string | Buffer,
  modifiedPath: string | Buffer,
): Promise<ImageComparisonResult> {
  const [img1, img2] = await Promise.all([
    // @ts-expect-error - type union
    Jimp.read(originalPath),
    // @ts-expect-error - type union
    Jimp.read(modifiedPath),
  ]);

  if (
    img1.getWidth() !== img2.getWidth() ||
    img1.getHeight() !== img2.getHeight()
  ) {
    throw new Error("Images must have the same dimensions");
  }

  let mse = 0;
  let maxDifference = 0;
  let pixelCount = 0;

  img1.scan(0, 0, img1.getWidth(), img1.getHeight(), function (x, y, idx) {
    // Compare RGB channels (skip alpha)
    for (let j = 0; j < 3; j++) {
      const diff = Math.abs(
        // biome-ignore lint/style/noNonNullAssertion: it's there
        this.bitmap.data[idx + j]! - img2.bitmap.data[idx + j]!,
      );
      mse += diff * diff;
      maxDifference = Math.max(maxDifference, diff);
      pixelCount++;
    }
  });

  mse /= pixelCount;

  // Calculate PSNR
  const psnr =
    mse === 0
      ? Number.POSITIVE_INFINITY
      : 20 * Math.log10(255 / Math.sqrt(mse));

  return { mse, psnr, maxDifference };
}

/**
 * Helper function to save a Jimp image to buffer
 */
export async function imageToBuffer(
  image: Jimp,
  format = "image/png",
): Promise<Buffer> {
  return await image.getBufferAsync(format);
}
