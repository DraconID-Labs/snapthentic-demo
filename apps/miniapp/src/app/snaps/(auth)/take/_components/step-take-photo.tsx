"use client";

import { Camera } from "lucide-react";
import { useState } from "react";
import { useRequestCameraPermissions } from "~/app/snaps/_hooks/use-request-camera-permissions";
import { CameraCapture } from "./camera-capture";
import type { StepProps } from "../page";

export function TakePhotoStep({ data, updateData, next }: StepProps) {
  const permissionGranted = useRequestCameraPermissions();
  const [showCamera, setShowCamera] = useState(permissionGranted);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(
    data.photo ?? null,
  );
  const [previewCaptured, setPreviewCaptured] = useState<boolean>(false);

  const handlePhotoCapture = (photoDataUrl: string) => {
    updateData({ photo: photoDataUrl });
    setCapturedPhoto(photoDataUrl);
    setShowCamera(false);
    setPreviewCaptured(false);
    next();
  };

  return (
    <div className="w-full space-y-4">
      {!capturedPhoto && !previewCaptured && (
        <div className="mx-auto flex max-w-fit flex-col items-center gap-2">
          <Camera className="size-[100px] text-gray-600/40" />
          <p className="text-lg font-semibold">Use native camera & smile!</p>
        </div>
      )}
      {showCamera && (
        <CameraCapture
          onPhotoCapture={handlePhotoCapture}
          onPreviewCapture={setPreviewCaptured}
        />
      )}
    </div>
  );
}
