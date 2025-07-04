"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { CameraCapture } from "./camera-capture";
import { useRequestCameraPermissions } from "~/app/snaps/_hooks/use-request-camera-permissions";
import type { StepComponentProps } from "../page";

export function TakePhotoStep({ data, updateData, next }: StepComponentProps) {
  const permissionGranted = useRequestCameraPermissions();
  const [showCamera, setShowCamera] = useState(permissionGranted);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(
    data.photo ?? null,
  );

  const handlePhotoCapture = (photoDataUrl: string) => {
    updateData({ photo: photoDataUrl });
    setCapturedPhoto(photoDataUrl);
    setShowCamera(false);
  };

  const handleCameraCancel = () => {
    setShowCamera(false);
  };

  const confirmAndNext = () => {
    if (capturedPhoto) {
      next();
    }
  };

  return (
    <div className="space-y-4">
      {!showCamera && !capturedPhoto && (
        <Button onClick={() => setShowCamera(true)}>Take a Photo</Button>
      )}

      {showCamera && (
        <CameraCapture
          onPhotoCapture={handlePhotoCapture}
          onCancel={handleCameraCancel}
        />
      )}

      {capturedPhoto && !showCamera && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Captured Photo</h3>
            <Button
              onClick={() => setShowCamera(true)}
              variant="outline"
              size="sm"
            >
              Retake
            </Button>
          </div>

          <div className="flex justify-center">
            <img
              src={capturedPhoto}
              alt="User captured content"
              className="max-h-96 max-w-full rounded-lg shadow-md"
            />
          </div>

          <Button onClick={confirmAndNext}>Confirm & Next</Button>
        </div>
      )}
    </div>
  );
}
