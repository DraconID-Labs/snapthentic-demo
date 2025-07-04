"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { Camera, Upload, RotateCcw, Check, X } from "lucide-react";

interface CameraCaptureProps {
  onPhotoCapture: (photoDataUrl: string) => void;
  onCancel?: () => void;
}

export function CameraCapture({
  onPhotoCapture,
  onCancel,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraSupported, setIsCameraSupported] = useState(true);

  const stopCamera = useCallback(() => {
    if (stream) {
      for (const track of stream.getTracks()) {
        track.stop();
      }
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setIsCameraSupported(false);
      setError("Camera not supported in this browser");
      return;
    }

    setIsStartingCamera(true);
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.autoplay = true;
        videoRef.current.playsInline = true;
        videoRef.current.muted = true;

        videoRef.current.onloadedmetadata = () => {
          setIsStartingCamera(false);
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(
        `Camera access failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
      setIsStartingCamera(false);
      setIsCameraSupported(false);
    }
  }, []);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(dataUrl);

    stopCamera();
  }, [stopCamera]);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
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
    if (isCameraSupported) {
      void startCamera();
    }
  }, [startCamera, isCameraSupported]);

  const resetCamera = useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    setIsStartingCamera(false);
    setError(null);
  }, [stopCamera]);

  const handleCancel = useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    setIsStartingCamera(false);
    setError(null);
    onCancel?.();
  }, [stopCamera, onCancel]);

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
              className="w-full rounded-lg shadow-md"
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

      <div className="space-y-3">
        {/* Camera options */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {/* Native camera (works great on iPhone) */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Camera className="mr-2 size-4" />
              Native Camera
            </Button>
          </div>

          {/* Gallery/File picker */}
          <div>
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
          </div>
        </div>

        {/* Web camera option */}
        {isCameraSupported && (
          <Button
            onClick={startCamera}
            variant="secondary"
            className="w-full"
            disabled={isStartingCamera}
          >
            <Camera className="mr-2 size-4" />
            Use Web Camera
          </Button>
        )}

        {/* Camera loading */}
        {isStartingCamera && (
          <div className="flex flex-col items-center space-y-2 p-8">
            <div className="size-8 animate-spin rounded-full border-b-2 border-blue-600" />
            <p className="text-sm text-gray-600">Starting camera...</p>
          </div>
        )}

        {/* Video preview for web camera */}
        {stream && !capturedImage && (
          <div className="space-y-3">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full rounded-lg bg-black"
                autoPlay
                playsInline
                muted
                style={{ minHeight: "200px" }}
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex space-x-2">
              <Button onClick={capturePhoto} className="flex-1">
                <Camera className="mr-2 size-4" />
                Capture Photo
              </Button>
              <Button onClick={resetCamera} variant="outline">
                Close Camera
              </Button>
            </div>
          </div>
        )}

        {/* Debug info when camera is accessed but not showing */}
        {isStartingCamera && (
          <div className="space-y-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center">
            <p className="text-sm text-yellow-800">
              Camera is starting... If you see a green light but no preview, try
              the native camera option instead.
            </p>
            <Button onClick={resetCamera} variant="outline" size="sm">
              Reset Camera
            </Button>
          </div>
        )}

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
