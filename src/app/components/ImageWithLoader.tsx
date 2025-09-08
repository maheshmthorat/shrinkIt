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
  const [zoom, setZoom] = useState(1);

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
              <div className="absolute top-4 left-4 flex items-center gap-2 z-20 bg-white/90 p-2 rounded shadow-md">
                <span className="text-sm font-semibold text-gray-700 mr-2">
                  Zoom:
                </span>

                <button
                  onClick={() => setZoom((z) => Math.max(z - 0.2, 1))}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded p-2 transition"
                  title="Zoom out"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 12H4"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => setZoom((z) => Math.min(z + 0.2, 5))}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded p-2 transition"
                  title="Zoom in"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>

                {zoom > 1 && (
                  <button
                    onClick={() => setZoom(1)}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded p-2 transition"
                    title="Reset zoom"
                  >
                    Reset
                  </button>
                )}
              </div>

              <ImgComparisonSlider
                style={
                  {
                    "--divider-color": "#7d7d7dd1",
                    "--divider-width": "2px",
                    "--default-handle-color": "#7d7d7dd1",
                    "--default-handle-width": "80px",
                  } as React.CSSProperties
                }
              >
                <img
                  slot="first"
                  src={originalBase64}
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "center center",
                  }}
                  alt="Original"
                />
                <img
                  slot="second"
                  src={compressedBase64}
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "center center",
                  }}
                  alt="Compressed"
                />
                <svg
                  {...{ slot: "handle" }}
                  xmlns="http://www.w3.org/2000/svg"
                  width="100"
                  viewBox="-8 -3 16 6"
                >
                  <path
                    stroke="#7d7d7dd1"
                    d="M -5 -2 L -7 0 L -5 2 M -5 -2 L -5 2 M 5 -2 L 7 0 L 5 2 M 5 -2 L 5 2"
                    fill="#7d7d7dd1"
                    vectorEffect="non-scaling-stroke"
                  ></path>
                </svg>
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
