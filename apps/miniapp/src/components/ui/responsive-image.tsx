/**
 * Responsive Image Components for Snapthentic
 *
 * 🎯 BATTLE-TESTED SOLUTIONS FOR ASPECT RATIO PRESERVATION:
 *
 * 1. ResponsiveImage - Adapts to image's natural aspect ratio
 *    ✅ Use for: Main content images, photo previews
 *    ✅ Benefits: No cropping, shows full image
 *
 * 2. AspectRatioImage - Fixed aspect ratio with smart cropping
 *    ✅ Use for: Grids, thumbnails, consistent layouts
 *    ✅ Benefits: Uniform appearance, better cropping
 *
 * 3. FeedImage - Optimized for social media feeds
 *    ✅ Use for: Feed posts, story layouts
 *    ✅ Benefits: Responsive heights, mobile-optimized
 */

"use client";

import { cn } from "~/utils/cn";
import LazyImage from "./lazy-image";
import { useState } from "react";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  maxHeight?: number;
  minHeight?: number;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  rounded?: boolean;
  priority?: boolean;
}

/**
 * ResponsiveImage - Preserves natural aspect ratio
 * Perfect for: Photo previews, main content images
 */
export function ResponsiveImage({
  src,
  alt,
  className,
  maxHeight = 600,
  minHeight = 200,
  objectFit = "contain",
  rounded = true,
  priority = false,
}: ResponsiveImageProps) {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.target as HTMLImageElement;
    const ratio = img.naturalWidth / img.naturalHeight;
    setAspectRatio(ratio);
  };

  const getContainerStyle = () => {
    if (!aspectRatio) {
      // Default container while loading
      return {
        width: "100%",
        height: `${Math.min(maxHeight, 400)}px`,
      };
    }

    // Use container's actual width instead of viewport width
    const containerWidth =
      typeof window !== "undefined"
        ? Math.min(window.innerWidth - 64, 600) // Account for container padding
        : 400;
    const calculatedHeight = Math.round(containerWidth / aspectRatio);

    // Clamp height between min and max
    const clampedHeight = Math.max(
      minHeight,
      Math.min(maxHeight, calculatedHeight),
    );

    return {
      width: "100%",
      height: `${clampedHeight}px`,
    };
  };

  if (imageError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100 text-gray-500",
          rounded && "rounded-lg",
          className,
        )}
        style={{ height: `${minHeight}px` }}
      >
        Failed to load image
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        rounded && "rounded-lg",
        className,
      )}
      style={getContainerStyle()}
    >
      <LazyImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={cn(
          objectFit === "cover" && "object-cover",
          objectFit === "contain" && "object-contain",
          objectFit === "fill" && "object-fill",
          objectFit === "none" && "object-none",
          objectFit === "scale-down" && "object-scale-down",
        )}
        onLoad={handleImageLoad}
        onError={() => setImageError(true)}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}

/**
 * AspectRatioImage - Fixed aspect ratio with smart cropping
 * Perfect for: Grids, thumbnails, consistent layouts
 */
export function AspectRatioImage({
  src,
  alt,
  aspectRatio = "16/9", // Can be "16/9", "4/3", "1/1", or custom like "3/2"
  className,
  objectFit = "cover",
  rounded = true,
  priority = false,
}: {
  src: string;
  alt: string;
  aspectRatio?: string;
  className?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  rounded?: boolean;
  priority?: boolean;
}) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div
        className={cn(
          `aspect-[${aspectRatio}] flex items-center justify-center bg-gray-100 text-gray-500`,
          rounded && "rounded-lg",
          className,
        )}
      >
        Failed to load image
      </div>
    );
  }

  return (
    <div
      className={cn(
        `aspect-[${aspectRatio}] relative overflow-hidden`,
        rounded && "rounded-lg",
        className,
      )}
    >
      <LazyImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={cn(
          objectFit === "cover" && "object-cover",
          objectFit === "contain" && "object-contain",
          objectFit === "fill" && "object-fill",
          objectFit === "none" && "object-none",
          objectFit === "scale-down" && "object-scale-down",
        )}
        onError={() => setImageError(true)}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}

/**
 * FeedImage - Optimized for social media feed layouts
 * Perfect for: Social media posts, story feeds
 */
export function FeedImage({
  src,
  alt,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.target as HTMLImageElement;
    const ratio = img.naturalWidth / img.naturalHeight;
    setAspectRatio(ratio);
  };

  const getOptimalDisplayMode = () => {
    if (!aspectRatio) return "loading";

    // Very wide images (panoramic)
    if (aspectRatio > 2.5) return "wide";

    // Wide images (landscape)
    if (aspectRatio > 1.5) return "landscape";

    // Square-ish images
    if (aspectRatio > 0.75) return "square";

    // Tall images (portrait)
    return "portrait";
  };

  const getContainerClass = () => {
    const mode = getOptimalDisplayMode();

    switch (mode) {
      case "wide":
        return "aspect-[3/1] max-h-[200px]";
      case "landscape":
        return "aspect-[16/9] max-h-[400px]";
      case "square":
        return "aspect-[4/3] max-h-[500px]";
      case "portrait":
        return "aspect-[3/4] max-h-[600px]";
      default:
        return "aspect-[4/3] max-h-[400px]";
    }
  };

  if (imageError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-gray-100 text-gray-500",
          getContainerClass(),
          className,
        )}
      >
        Failed to load image
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg",
        getContainerClass(),
        className,
      )}
    >
      <LazyImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover"
        onLoad={handleImageLoad}
        onError={() => setImageError(true)}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}

/**
 * Common aspect ratios for reference:
 *
 * Social Media:
 * - "1/1" - Instagram square
 * - "4/5" - Instagram portrait
 * - "16/9" - YouTube thumbnail
 * - "9/16" - TikTok/Stories
 *
 * Photography:
 * - "3/2" - Classic 35mm film
 * - "4/3" - Traditional camera
 * - "16/10" - Wide monitor
 * - "21/9" - Ultra-wide
 */
