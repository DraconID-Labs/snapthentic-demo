"use client";

import { Check, RotateCcw, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "~/components/ui/button";

interface CameraCaptureProps {
  onPhotoCapture: (photoDataUrl: string) => void;
  onCancel?: () => void;
}

export function CameraCapture({
  onPhotoCapture,
  onCancel,
}: CameraCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const galleryInputRef = useRef<HTMLInputElement>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleCancel = useCallback(() => {
    setCapturedImage(null);
    setError(null);
    onCancel?.();
  }, [onCancel]);

  // Photo preview and confirmation
  if (capturedImage) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Review Photo</h3>

        <div className="flex flex-col items-center space-y-4">
          <div className="max-w-sm">
            <img
              src={capturedImage}
              alt="Captured"
              className="max-h-[400px] w-full rounded-lg shadow-md"
            />
          </div>

          <div className="flex">
            <Button onClick={handleRetake} variant="outline">
              <RotateCcw className="mr-2 size-4" />
              Retake
            </Button>
            <Button onClick={handleConfirm} className="ml-2">
              <Check className="mr-2 size-4" />
              Use Photo
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Camera</h3>
        <Button onClick={handleCancel} variant="ghost" size="sm">
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex-col justify-end space-y-4">
        {/* Camera options */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {/* Native camera (works great on iPhone) */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-blue-500"
            >
              Take Photo
            </Button>
          </div>

          {/* Gallery/File picker */}
          {/* <div>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => galleryInputRef.current?.click()}
              variant="outline"
              className="w-full"
            >
              <Upload className="mr-2 size-4" />
              Choose from Gallery
            </Button>
          </div> */}
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
