/**
 * Image Compression Utility for Snapthentic
 *
 * This utility compresses images on the client-side before processing to:
 * 1. Reduce upload sizes (20MB → ~2-5MB typical reduction)
 * 2. Speed up hashing and signing operations
 * 3. Reduce memory usage during processing
 * 4. Improve overall app performance
 *
 * The compression happens BEFORE the base64 data URL is created,
 * ensuring the cryptographic hash and signature are computed on
 * the compressed image, maintaining security integrity.
 *
 * Optimization settings:
 * - Standard photos: 1920x1080 @ 80% quality
 * - Large photos (>10MB): 1280x1080 @ 60% quality
 * - Maintains aspect ratio
 * - JPEG compression with configurable quality
 */

/**
 * Compresses an image file using HTML5 Canvas
 * @param file - The original image file
 * @param maxWidth - Maximum width (default: 1920)
 * @param maxHeight - Maximum height (default: 1080)
 * @param quality - JPEG quality 0-1 (default: 0.8)
 * @returns Promise<Blob> - Compressed image blob
 */
export async function compressImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.8,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to compress image"));
          }
        },
        "image/jpeg",
        quality,
      );
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    // Create object URL for the image
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Converts a Blob to a data URL
 * @param blob - The image blob
 * @returns Promise<string> - Base64 data URL
 */
export async function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert blob to data URL"));
      }
    };
    reader.onerror = () => reject(new Error("FileReader error"));
    reader.readAsDataURL(blob);
  });
}

/**
 * Compresses an image file and returns a data URL
 * @param file - The original image file
 * @param options - Compression options
 * @returns Promise<string> - Compressed image as base64 data URL
 */
export async function compressImageToDataURL(
  file: File,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  },
): Promise<string> {
  const { maxWidth = 1920, maxHeight = 1080, quality = 0.8 } = options ?? {};

  const compressedBlob = await compressImage(
    file,
    maxWidth,
    maxHeight,
    quality,
  );
  return await blobToDataURL(compressedBlob);
}

/**
 * Gets the size reduction percentage
 * @param originalSize - Original file size in bytes
 * @param compressedSize - Compressed size in bytes
 * @returns Percentage reduction
 */
export function getSizeReduction(
  originalSize: number,
  compressedSize: number,
): number {
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}
