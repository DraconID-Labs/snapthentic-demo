"use client";

import { Check, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";

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

  useEffect(() => {
    onPreviewCapture(!!capturedImage);
  }, [capturedImage, onPreviewCapture]);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/jpeg")) {
        setError("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        setCapturedImage(dataUrl);
      };
      reader.readAsDataURL(file);

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
  }, []);

  const resetCamera = useCallback(() => {
    setCapturedImage(null);
    setError(null);
  }, []);

  // Photo preview and confirmation
  if (capturedImage) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-full">
            <img
              src={capturedImage}
              alt="Captured"
              className="aspect-[4/3] w-full rounded-lg object-cover shadow-md"
            />
          </div>

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
            accept="image/jpeg"
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
