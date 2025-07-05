import { useCallback, useState } from "react";

// export function useShareOnX({ url }: { url: string }) {
//   const webUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(url)}`;
//   const appUrl = `twitter://post?message=${encodeURIComponent(url)}`;

//   const handleShare = useCallback(() => {
//     // const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
//     const isMobile = true;

//     if (isMobile) {
//       // Try opening the Twitter app
//       window.location.href = appUrl;

//       // Fallback to browser if app doesn't open
//       setTimeout(() => {
//         window.open(webUrl, "_blank");
//       }, 1500); // Delay allows time for app to open if installed
//     } else {
//       // Desktop fallback
//       window.open(webUrl, "_blank");
//     }
//   }, [appUrl, webUrl]);

//   return { handleShare, xUrl: webUrl };
// }

export function useCopyUrl({ url }: { url: string }) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  const handleCopy = useCallback(async () => {
    try {
      await window.navigator.clipboard.writeText(url);
      setCopyStatus("copied");

      // Reset status after 2 seconds
      setTimeout(() => {
        setCopyStatus("idle");
      }, 2000);
    } catch {
      setCopyStatus("error");

      // Reset status after 2 seconds
      setTimeout(() => {
        setCopyStatus("idle");
      }, 2000);
    }
  }, [url]);

  return {
    handleCopy,
    copyStatus,
    isCopied: copyStatus === "copied",
    isError: copyStatus === "error",
  };
}
