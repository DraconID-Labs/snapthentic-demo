/* eslint-disable jsx-a11y/alt-text */
"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type Props = ImageProps;

export default function LazyImage(props: Props) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="size-full">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200">
          <div className="size-full animate-pulse bg-gray-400" />
        </div>
      )}
      <Image
        {...props}
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
        className={`transition-opacity duration-500 ${isLoading ? "opacity-0" : "opacity-100"}`}
      />
    </div>
  );
}
