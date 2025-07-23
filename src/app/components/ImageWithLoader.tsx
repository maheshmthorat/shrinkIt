"use client";

import Image from "next/image";
import React, { useState } from "react";
import { ImgComparisonSlider } from "@img-comparison-slider/react";

const ImageWithLoader = ({
  item,
  compressedBase64,
  originalBase64,
  alt,
  className,
}: {
  item: { filename: string; originalSize: number; compressedSize: number };
  originalBase64: string;
  compressedBase64: string;
  alt: string;
  className?: string;
}) => {
  const [loaded, setLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const percentSaved =
    item.originalSize > 0
      ? Math.round(
          Math.abs(
            ((item.originalSize - item.compressedSize) / item.originalSize) *
              100
          )
        )
      : 0;

  const ext = item.filename?.split(".").pop()?.toLowerCase();

  const originalKB = item.originalSize / 1024;
  const compressedKB = item.compressedSize / 1024;

  return (
    <>
      <div
        className="w-20 h-20 bg-gray-200 rounded object-cover relative cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-6 h-6 border-4 border-blue-300 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <Image
          src={compressedBase64}
          alt={alt}
          width={212}
          height={212}
          className={className}
          unoptimized
          onLoad={() => setLoaded(true)}
        />
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setShowModal(false)} // backdrop click to close
        >
          <div
            className="bg-white lg shadow-xl max-w-2xl w-full relative"
            onClick={(e) => e.stopPropagation()} // prevent click inside modal from closing
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute z-10 top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-70 cursor-pointer rounded-full text-2xl w-10 h-10 flex items-center justify-center text-lg transition"
            >
              ✕
            </button>

            <div className="relative">
              <ImgComparisonSlider>
                <img
                  slot="first"
                  src={originalBase64}
                  style={{
                    transform: "scale(3)",
                    transformOrigin: "center center",
                  }}
                  alt="Original"
                />
                <img
                  slot="second"
                  src={compressedBase64}
                  style={{
                    transform: "scale(3)",
                    transformOrigin: "center center",
                  }}
                  alt="Compressed"
                />
              </ImgComparisonSlider>

              <span className="absolute bottom-4 left-4 text-xs text-white bg-blue-500 px-3 py-1.5 rounded-full font-bold text-center w-max">
                Original
              </span>

              <span className="absolute bottom-4 right-4 text-xs text-green-800 bg-green-100 px-3 py-1.5 rounded-full font-bold text-center w-max">
                Compressed
              </span>
            </div>
            <div className="p-4 flex flex-col gap-2 text-sm text-gray-700 w-full">
              <div className="flex justify-between items-center gap-2">
                <div>
                  <strong>Original:</strong> {originalKB.toFixed(0)} KB
                </div>
                <a
                  href={compressedBase64}
                  download
                  className="bg-blue-100 hover:bg-blue-200 text-blue-600 font-semibold text-xs px-2 py-2 rounded flex items-center gap-1 w-max"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="text-blue-600"
                  >
                    <path d="M12 16l4-5h-3V4h-2v7H8l4 5zM5 18h14v2H5z" />
                  </svg>
                  Download
                </a>
              </div>
              <div className="flex justify-between items-center gap-2">
                <div>
                  <strong>Compressed:</strong> {compressedKB.toFixed(0)} KB
                </div>
                <span className="text-xs text-green-800 bg-green-100 px-3 py-1.5 rounded-full font-bold text-center w-max">
                  {percentSaved > 0
                    ? `Saved ${percentSaved.toFixed(0)}%`
                    : `+${Math.abs(percentSaved).toFixed(0)}% larger`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageWithLoader;
