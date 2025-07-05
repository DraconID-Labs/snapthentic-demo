"use client";

import { AlertCircle, Check, Send, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Code } from "~/components/ui/code";
import { api } from "~/trpc/react";

interface VerificationData {
  onchain: {
    hash: string;
    signature: string;
    signerAddress: string;
    txHash: string;
  };
  system: Partial<{
    snapId: string;
    author: string;
    createdAt: string;
    txHash: string;
    hash: string;
    signature: string;
    signerAddress: string;
    signatureVersion: string;
  }>;
}

interface VerificationResult {
  success: boolean;
  message: string;
  data?: VerificationData;
}

export default function VerifyPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/jpeg")) {
        alert("Please select an image file");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setUploadedImage(dataUrl);
      };
      reader.readAsDataURL(file);

      // Clear previous results
      setVerificationResult(null);
    },
    [],
  );

  const handleRemoveImage = useCallback(() => {
    setUploadedImage(null);
    setImageFile(null);
    setVerificationResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const { mutate: verifyImage, isPending: isVerifying } =
    api.snaps.verify.useMutation({
      onSuccess: (data) => {
        setVerificationResult({
          success: true,
          message:
            "Image verified successfully! This appears to be an authentic snap.",
          data: {
            onchain: data.onchain,
            system: {
              ...data.system,
              createdAt: data.system.createdAt?.toISOString(),
            },
          },
        });
      },
      onError: (error) => {
        setVerificationResult({
          success: false,
          message:
            error.message ||
            "Verification failed. This image may not be an authentic snap.",
        });
      },
    });

  const handleVerifyImage = async () => {
    if (!uploadedImage || !imageFile) return;

    setVerificationResult(null);

    try {
      verifyImage({ photoData: uploadedImage });
    } catch {
      setVerificationResult({
        success: false,
        message: "Verification failed. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Verify</h1>
          <p className="mt-2 text-gray-600">
            Wondering if that snap is real? Upload it here to verify it.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="size-5" />
              Upload Image
            </CardTitle>
            <CardDescription>
              Select an image file to verify. Supported formats: JPG, PNG, GIF,
              WebP
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!uploadedImage ? (
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                <Upload className="mx-auto size-12 text-gray-400" />
                <div className="mt-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="mb-2"
                  >
                    Choose Image
                  </Button>
                  <p className="text-sm text-gray-500">
                    or drag and drop an image here
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={uploadedImage}
                    alt="Uploaded for verification"
                    className="max-h-96 w-full rounded-lg border object-contain"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Button onClick={handleVerifyImage} disabled={isVerifying}>
                    {isVerifying ? (
                      <>
                        <div className="mr-2 size-4 animate-spin rounded-full border-b-2 border-white" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 size-4" />
                        Verify Image
                      </>
                    )}
                  </Button>
                  <Button onClick={handleRemoveImage} variant="outline">
                    <Upload className="mr-2 size-4" />
                    Upload Different
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {verificationResult && (
          <Card
            className={
              verificationResult.success
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }
          >
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-2 ${verificationResult.success ? "text-green-700" : "text-red-700"}`}
              >
                {verificationResult.success ? (
                  <Check className="size-5" />
                ) : (
                  <AlertCircle className="size-5" />
                )}
                Verification Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`font-medium ${verificationResult.success ? "text-green-800" : "text-red-800"}`}
              >
                {verificationResult.message}
              </p>
              {verificationResult.data && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Author:</span>{" "}
                    <Code className="border-none bg-transparent">
                      {verificationResult.data.onchain.signerAddress}
                    </Code>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Created At:</span>{" "}
                    <Code className="border-none bg-transparent">
                      {verificationResult.data.system.createdAt
                        ? new Date(
                            verificationResult.data.system.createdAt,
                          ).toLocaleString()
                        : "N/A"}
                    </Code>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Hash:</span>{" "}
                    <Code className="border-none bg-transparent">
                      {verificationResult.data.onchain.hash}
                    </Code>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Signature:</span>{" "}
                    <Code className="border-none bg-transparent">
                      {verificationResult.data.onchain.signature}
                    </Code>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Signer Address:</span>{" "}
                    <Code className="border-none bg-transparent">
                      {verificationResult.data.onchain.signerAddress}
                    </Code>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Tx Hash:</span>{" "}
                    <Code className="border-none bg-transparent">
                      {verificationResult.data.onchain.txHash}
                    </Code>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>• Upload an image you want to verify</p>
            <p>• Our system checks for digital signatures and metadata</p>
            <p>• We analyze the image for signs of tampering or manipulation</p>
            <p>• Results show authenticity and verification details</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
