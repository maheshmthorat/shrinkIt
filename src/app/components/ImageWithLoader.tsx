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
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        } w-28 h-auto`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

export default ImageWithLoader;
