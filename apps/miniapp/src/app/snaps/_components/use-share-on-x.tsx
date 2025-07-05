import { useCallback } from "react";

export function useShareOnX({ url }: { url: string }) {
  const xUrl = `https://x.com/intent/post?text=${encodeURIComponent(url)}`;

  const handleShare = useCallback(() => {
    window.open(xUrl, "_blank");
  }, [xUrl]);

  return { handleShare, xUrl };
}
