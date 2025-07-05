"use client";

import { Check, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { ResponsiveImage } from "~/components/ui/responsive-image";
import {
  compressImageToDataURL,
  getSizeReduction,
} from "../_utils/compress-image";

interface CameraCaptureProps {
  onPhotoCapture: (photoDataUrl: string) => void;
  onPreviewCapture: (previewActive: boolean) => void;
}

export function CameraCapture({
  onPhotoCapture,
  onPreviewCapture,
}: CameraCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: number;
    compressedSize: number;
    reduction: number;
  } | null>(null);

  useEffect(() => {
    onPreviewCapture(!!capturedImage);
  }, [capturedImage, onPreviewCapture]);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      setIsCompressing(true);
      setError(null);

      try {
        const originalSize = file.size;

        // Compress the image with aggressive settings for large files
        const quality = file.size > 10 * 1024 * 1024 ? 0.6 : 0.8; // Lower quality for files > 10MB
        const maxWidth = file.size > 10 * 1024 * 1024 ? 1280 : 1920; // Smaller dimensions for large files

        const compressedDataUrl = await compressImageToDataURL(file, {
          maxWidth,
          maxHeight: 1080,
          quality,
        });

        // Calculate compressed size (approximate from base64)
        const base64Length = compressedDataUrl.split(",")[1]?.length ?? 0;
        const compressedSize = (base64Length * 3) / 4; // Base64 to bytes conversion

        const reduction = getSizeReduction(originalSize, compressedSize);

        setCompressionStats({
          originalSize,
          compressedSize,
          reduction,
        });

        setCapturedImage(compressedDataUrl);
      } catch (err) {
        console.error("Compression failed:", err);
        setError("Failed to compress image. Please try again.");
      } finally {
        setIsCompressing(false);
      }

      // Reset the input
      event.target.value = "";
    },
    [],
  );

  const handleConfirm = useCallback(() => {
    if (capturedImage) {
      onPhotoCapture(capturedImage);
    }
  }, [capturedImage, onPhotoCapture]);

  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    setError(null);
    setCompressionStats(null);
  }, []);

  const resetCamera = useCallback(() => {
    setCapturedImage(null);
    setError(null);
    setCompressionStats(null);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Show compression progress
  if (isCompressing) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="size-8 animate-spin rounded-full border-b-2 border-blue-600" />
        <p className="text-sm text-gray-600">Optimizing image...</p>
      </div>
    );
  }

  // Photo preview and confirmation
  if (capturedImage) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <ResponsiveImage
            src={capturedImage}
            alt="Captured photo"
            maxHeight={500}
            minHeight={200}
            objectFit="contain"
            className="w-full shadow-md"
          />

          {/* Compression stats */}
          {compressionStats && (
            <div className="w-full rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="text-sm text-green-800">
                <div className="font-medium">Image Optimized! 🎉</div>
                <div className="mt-1 text-xs text-green-600">
                  {formatFileSize(compressionStats.originalSize)} →{" "}
                  {formatFileSize(compressionStats.compressedSize)}
                  <span className="font-medium">
                    {" "}
                    ({compressionStats.reduction}% smaller)
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex w-full justify-center gap-2">
            <Button onClick={handleRetake} variant="outline" className="flex-1">
              <RotateCcw className="mr-2 size-4" />
              Retake
            </Button>
            <Button onClick={handleConfirm} className="flex-1">
              <Check className="mr-2 size-4" />
              Use Photo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center space-y-4">
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Camera options */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button onClick={() => fileInputRef.current?.click()}>
            Take Photo
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center">
            <p className="text-sm text-red-800">{error}</p>
            <Button
              onClick={resetCamera}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
