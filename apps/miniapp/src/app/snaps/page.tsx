"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { CameraCapture } from "~/components/camera-capture";
import { useRequestCameraPermissions } from "~/hooks/request-camera-permissions";

export default function Page() {
  const permissionGranted = useRequestCameraPermissions();

  const [showCamera, setShowCamera] = useState(permissionGranted);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const {
    data: profile,
    isLoading,
    isError,
  } = api.userProfile.getMyProfile.useQuery();

  const handlePhotoCapture = (photoDataUrl: string) => {
    setCapturedPhoto(photoDataUrl);
    setShowCamera(false);
  };

  const handleCameraCancel = () => {
    setShowCamera(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!profile || isError) {
    return <div>No profile found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Photo Capture Section */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Photo Capture
          </h2>

          {!showCamera && !capturedPhoto && (
            <Button onClick={() => setShowCamera(true)} className="mb-4">
              Take a Photo
            </Button>
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
                <h3 className="text-md font-semibold text-gray-700">
                  Captured Photo
                </h3>
                <Button
                  onClick={() => setShowCamera(true)}
                  variant="outline"
                  size="sm"
                >
                  Take New Photo
                </Button>
              </div>
              <div className="flex justify-center">
                <img
                  src={capturedPhoto}
                  alt="User captured content"
                  className="max-h-96 max-w-full rounded-lg shadow-md"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
