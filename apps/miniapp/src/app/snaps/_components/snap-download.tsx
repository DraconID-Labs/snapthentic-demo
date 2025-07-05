import type { SnapWithAuthor } from "@snapthentic/database/schema";
import { DownloadCloud, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";

export function SnapDownload({ snap }: { snap: SnapWithAuthor }) {
  const [isDownloading, setIsDownloading] = useState(false);

  // Simple mobile detection
  const isMobile = () => {
    const userAgent = navigator.userAgent;
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent,
    );
  };

  // Check if Web Share API is available and supports files
  const canShareFiles = () => {
    return "share" in navigator && "canShare" in navigator;
  };

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      // Try Web Share API first if available (works well on mobile)
      if (isMobile() && canShareFiles()) {
        try {
          const response = await fetch(snap.photoUrl);
          const blob = await response.blob();
          const file = new File([blob], `${snap.title ?? "snap"}.jpeg`, {
            type: blob.type,
          });

          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: snap.title ?? "Snap",
              text: "Check out this snap!",
            });
            return;
          }
        } catch {
          console.log("Web Share API failed, trying download");
        }
      }

      // Try traditional download
      try {
        const response = await fetch(snap.photoUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        // Determine file extension from content type
        const contentType = response.headers.get("content-type") ?? "";
        let extension = ".jpeg"; // default

        if (contentType.includes("png")) {
          extension = ".png";
        } else if (contentType.includes("webp")) {
          extension = ".webp";
        } else if (contentType.includes("gif")) {
          extension = ".gif";
        }

        // Create and trigger download
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `${snap.title ?? "snap"}${extension}`;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Clean up the blob URL
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 100);
      } catch {
        // Fallback: open in new tab (works in most environments)
        window.open(snap.photoUrl, "_blank", "noopener,noreferrer");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      className="w-full"
      onClick={handleDownload}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <DownloadCloud className="size-4" />
      )}
      <span>{isDownloading ? "Processing..." : "Download"}</span>
    </Button>
  );
}
