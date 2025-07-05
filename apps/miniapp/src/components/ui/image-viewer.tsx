"use client";

import { X, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./button";

interface ImageViewerProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageViewer({ src, alt, isOpen, onClose }: ImageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [rotation, setRotation] = useState(0);

  // Reset state when opening/closing
  useEffect(() => {
    if (isOpen) {
      // Reset everything to defaults
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
      setIsDragging(false);
      setLastTouchDistance(0);
    }
  }, [isOpen]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "=":
        case "+":
          e.preventDefault();
          handleZoomIn();
          break;
        case "-":
          e.preventDefault();
          handleZoomOut();
          break;
        case "0":
          e.preventDefault();
          resetZoom();
          break;
        case "r":
          e.preventDefault();
          handleRotate();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Calculate panning bounds to prevent image from going off-screen
  const calculateBounds = useCallback(() => {
    if (!imageRef.current || !containerRef.current) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    const img = imageRef.current;

    const imgWidth = (img.naturalWidth || img.width) * scale;
    const imgHeight = (img.naturalHeight || img.height) * scale;

    // Keep at least 100px of image visible on each side
    const minVisiblePx = 100;

    const maxX = Math.max(0, (imgWidth - minVisiblePx) / 2);
    const minX = Math.min(0, -(imgWidth - minVisiblePx) / 2);
    const maxY = Math.max(0, (imgHeight - minVisiblePx) / 2);
    const minY = Math.min(0, -(imgHeight - minVisiblePx) / 2);

    return { minX, maxX, minY, maxY };
  }, [scale]);

  // Constrain position within bounds
  const constrainPosition = useCallback(
    (newPosition: { x: number; y: number }) => {
      const bounds = calculateBounds();
      return {
        x: Math.max(bounds.minX, Math.min(bounds.maxX, newPosition.x)),
        y: Math.max(bounds.minY, Math.min(bounds.maxY, newPosition.y)),
      };
    },
    [calculateBounds],
  );

  const handleZoomIn = useCallback(() => {
    setScale((prev) => {
      const newScale = Math.min(prev * 1.5, 5);
      // Re-constrain position after zoom change
      requestAnimationFrame(() => {
        setPosition((current) => constrainPosition(current));
      });
      return newScale;
    });
  }, [constrainPosition]);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const newScale = Math.max(prev / 1.5, 0.2);
      // Re-constrain position after zoom change
      requestAnimationFrame(() => {
        setPosition((current) => constrainPosition(current));
      });
      return newScale;
    });
  }, [constrainPosition]);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  // Mouse events
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return; // Only left click
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    },
    [position],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      const newPosition = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      };

      setPosition(constrainPosition(newPosition));
    },
    [isDragging, dragStart, constrainPosition],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch events for mobile
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 1) {
        // Single touch - start dragging
        const touch = e.touches[0];
        if (touch) {
          setIsDragging(true);
          setDragStart({
            x: touch.clientX - position.x,
            y: touch.clientY - position.y,
          });
        }
      } else if (e.touches.length === 2) {
        // Two finger pinch - start zooming
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        if (touch1 && touch2) {
          const distance = Math.sqrt(
            (touch2.clientX - touch1.clientX) ** 2 +
              (touch2.clientY - touch1.clientY) ** 2,
          );
          setLastTouchDistance(distance);
        }
      }
    },
    [position],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 1 && isDragging) {
        // Single touch drag
        const touch = e.touches[0];
        if (touch) {
          const newPosition = {
            x: touch.clientX - dragStart.x,
            y: touch.clientY - dragStart.y,
          };
          setPosition(constrainPosition(newPosition));
        }
      } else if (e.touches.length === 2) {
        // Pinch zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        if (touch1 && touch2) {
          const distance = Math.sqrt(
            (touch2.clientX - touch1.clientX) ** 2 +
              (touch2.clientY - touch1.clientY) ** 2,
          );

          if (lastTouchDistance > 0) {
            const scaleChange = distance / lastTouchDistance;
            setScale((prev) => {
              const newScale = Math.min(Math.max(prev * scaleChange, 0.2), 5);
              // Re-constrain position after zoom change
              requestAnimationFrame(() => {
                setPosition((current) => constrainPosition(current));
              });
              return newScale;
            });
          }
          setLastTouchDistance(distance);
        }
      }
    },
    [isDragging, dragStart, lastTouchDistance, constrainPosition],
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setLastTouchDistance(0);
  }, []);

  // Wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY;
      const scaleChange = delta > 0 ? 0.9 : 1.1;
      setScale((prev) => {
        const newScale = Math.min(Math.max(prev * scaleChange, 0.2), 5);
        // Re-constrain position after zoom change
        requestAnimationFrame(() => {
          setPosition((current) => constrainPosition(current));
        });
        return newScale;
      });
    },
    [constrainPosition],
  );

  // Double click/tap to zoom
  const handleDoubleClick = useCallback(() => {
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2);
    }
  }, [scale, resetZoom]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95">
      {/* Controls */}
      <div className="absolute inset-x-4 top-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="border-white/20 bg-black/50 text-white hover:bg-white/20"
          >
            <ZoomOut className="size-4" />
          </Button>
          <span className="rounded bg-black/50 px-2 py-1 font-mono text-sm text-white">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="border-white/20 bg-black/50 text-white hover:bg-white/20"
          >
            <ZoomIn className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotate}
            className="border-white/20 bg-black/50 text-white hover:bg-white/20"
          >
            <RotateCw className="size-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="border-white/20 bg-black/50 text-white hover:bg-white/20"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
        <div className="rounded-full bg-black/50 px-3 py-1 text-xs text-white">
          🖱️ Drag to pan • 🔍 Scroll to zoom • ✋ Pinch on mobile • ⌨️ ESC to
          close
        </div>
      </div>

      {/* Image Container */}
      <div
        ref={containerRef}
        className="relative size-full cursor-grab overflow-hidden active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className="absolute max-w-none select-none transition-transform duration-100 ease-out"
          style={{
            transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${scale}) rotate(${rotation}deg)`,
            left: "50%",
            top: "50%",
            transformOrigin: "center center",
            maxWidth: scale === 1 ? "90vw" : "none",
            maxHeight: scale === 1 ? "90vh" : "none",
          }}
          draggable={false}
          onLoad={() => {
            // Auto-fit image to screen on load with better logic
            if (imageRef.current && containerRef.current) {
              const img = imageRef.current;
              const container = containerRef.current;

              // Wait a frame to ensure dimensions are available
              requestAnimationFrame(() => {
                const imgWidth = img.naturalWidth || img.width;
                const imgHeight = img.naturalHeight || img.height;
                const containerWidth = container.clientWidth;
                const containerHeight = container.clientHeight;

                // Only scale down if image is larger than container
                if (imgWidth > containerWidth || imgHeight > containerHeight) {
                  const scaleX = containerWidth / imgWidth;
                  const scaleY = containerHeight / imgHeight;
                  const autoScale = Math.min(scaleX, scaleY) * 0.9; // 90% to add some padding
                  setScale(autoScale);
                } else {
                  // Image fits, no need to scale
                  setScale(1);
                }
              });
            }
          }}
        />
      </div>

      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
      />
    </div>
  );
}
