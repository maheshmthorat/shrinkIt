import Image from "next/image";
import React, { useState } from "react";

const ImageWithLoader = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-4 border-blue-300 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <Image
        src={src} // must be base64 string
        alt={alt}
        width={112} // equivalent to w-28 (28 * 4)
        height={112}
        className={className}
        unoptimized
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

export default ImageWithLoader;
