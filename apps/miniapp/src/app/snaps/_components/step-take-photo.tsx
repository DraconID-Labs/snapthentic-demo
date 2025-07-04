"use client";

import { useState } from "react";
import { useRequestCameraPermissions } from "~/app/snaps/_hooks/use-request-camera-permissions";
import { Button } from "~/components/ui/button";
import type { StepComponentProps } from "../page";
import { CameraCapture } from "./camera-capture";

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
    next();
  };

  const handleCameraCancel = () => {
    setShowCamera(false);
  };

  return (
    <div className="w-full space-y-4">
      {!showCamera && !capturedPhoto && (
        <Button className="bg-blue-400" onClick={() => setShowCamera(true)}>
          Take a Photo
        </Button>
      )}

      {showCamera && (
        <CameraCapture
          onPhotoCapture={handlePhotoCapture}
          onCancel={handleCameraCancel}
        />
      )}
    </div>
  );
}
