"use client";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ImageWithLoader from "./components/ImageWithLoader";
import Shimmer from "./components/Shimmer";

type ImageResult = {
  filename: string;
  originalUrl: string;
  compressedUrl: string;
  originalSize: number;
  compressedSize: number;
};

export default function Home() {
  const localUrl = "http://localhost:5000";

  const [results, setResults] = useState<ImageResult[]>([]);
  const [zipUrl, setZipUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");

  const handleUpload = async (
    e: React.FormEvent<HTMLFormElement> | React.ChangeEvent<HTMLInputElement>
  ) => {
    e.preventDefault?.(); // Only call if it's a form event
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    const files = (document.getElementById("images") as HTMLInputElement).files;
    if (!files?.length) return;

    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    const res = await fetch(`${localUrl}/upload?sessionId=${sessionId}`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const data = await res.json();
    setResults(() => [...data.images]);
    setZipUrl(data.zipUrl || zipUrl);
    setLoading(false);
  };

  const handleFiles = (files: FileList) => {
    setLoading(true);
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("images", file));

    fetch(`${localUrl}/upload?sessionId=${sessionId}`, {
      method: "POST",
      body: formData,
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setResults(() => [...data.images]);
        setLoading(false);
      })
      .catch((err) => console.error("Upload failed", err));
  };

  function getCookie(cname: string) {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  useEffect(() => {
    setLoading(true);
    let sessionId = null;
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("shrinkit_session="));

    if (cookie) {
      sessionId = getCookie("shrinkit_session");
    } else {
      sessionId = uuidv4();
      document.cookie = `shrinkit_session=${sessionId}; path=/; max-age=${
        7 * 24 * 60 * 60
      }`;
    }
    setSessionId(sessionId);

    fetch(`${localUrl}/session/images?sessionId=${sessionId}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.images) {
          setResults(data.images);
          if (data.zipUrl) setZipUrl(data.zipUrl);
          setLoading(false);
        }
      });
  }, []);

  const { totalOriginal, totalCompressed } = results.reduce(
    (acc, item) => {
      acc.totalOriginal += item?.originalSize || 0;
      acc.totalCompressed += item?.compressedSize || 0;
      return acc;
    },
    { totalOriginal: 0, totalCompressed: 0 }
  );

  const totalSaved = totalOriginal - totalCompressed;
  const averageSavedPercent =
    totalOriginal > 0 ? ((totalSaved / totalOriginal) * 100).toFixed(0) : 0;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        ShrinkIt - Image Compressor
      </h1>

      <form
        onSubmit={handleUpload}
        className="bg-white p-6 rounded-xl shadow max-w-md mx-auto"
      >
        <label
          htmlFor="images"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length > 0) {
              handleFiles(files);
            }
          }}
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-48 cursor-pointer transition hover:border-blue-500 hover:bg-blue-50 text-gray-500 text-sm text-center"
        >
          <svg
            className="w-12 h-12 mb-2 text-blue-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 16V4m0 0L3 8m4-4l4 4m5 4h3a2 2 0 012 2v4a2 2 0 01-2 2h-3m-4 0H7a2 2 0 01-2-2v-4a2 2 0 012-2h3"
            />
          </svg>
          <p className="text-sm">Click or drag & drop files here to upload</p>
          <p className="text-xs text-gray-400">Only PNG, JPG, JPEG, SVG, GIF</p>
          <input
            type="file"
            id="images"
            name="images"
            multiple
            required
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
        </label>
      </form>

      {loading ? (
        <Shimmer />
      ) : (
        <>
          {results.length > 0 && (
            <div className="mt-10 bg-gray-50 rounded-xl shadow-inner p-6 max-w-screen-lg mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-green-700">
                  🎉 ShrinkIt just saved you {averageSavedPercent}%!
                </h2>
                <div>
                  {zipUrl && (
                    <a
                      href={`${localUrl}${zipUrl}`}
                      download
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      ⬇️ Download all images
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-4 mt-8">
                {results.map((item, idx) => {
                  const originalKB = item.originalSize / 1024;
                  const compressedKB = item.compressedSize / 1024;
                  const percentSaved =
                    originalKB > 0
                      ? ((originalKB - compressedKB) / originalKB) * 100
                      : 0;

                  const ext = item.filename?.split(".").pop()?.toLowerCase();
                  const badgeColors = {
                    jpg: "bg-blue-600",
                    jpeg: "bg-blue-600",
                    png: "bg-green-600",
                    gif: "bg-purple-600",
                    svg: "bg-pink-600",
                    default: "bg-gray-600",
                  };
                  const badgeColor =
                    badgeColors[ext as keyof typeof badgeColors] ||
                    badgeColors.default;

                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-lg shadow flex items-center px-4 py-3 justify-between"
                    >
                      {/* Thumbnail */}
                      <div className="flex items-center gap-4">
                        <ImageWithLoader
                          src={`${localUrl}${item.compressedUrl}`}
                          alt="Thumbnail"
                          className="w-12 h-12 rounded object-cover border"
                        />
                        <div>
                          <p className="font-medium text-sm text-gray-800">
                            {item.filename}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-xs text-white px-2 py-0.5 rounded-full ${badgeColor}`}
                            >
                              {ext?.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-600">
                              {originalKB.toFixed(0)} KB →{" "}
                              {compressedKB.toFixed(0)} KB
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Compression and Download */}
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-gray-700">
                          -{percentSaved.toFixed(0)}%
                        </span>
                        <a
                          href={`${localUrl}${item.compressedUrl}`}
                          download
                          className="bg-blue-100 hover:bg-blue-200 text-blue-600 font-semibold text-xs px-3 py-1 rounded flex items-center gap-1"
                        >
                          ⬇️ {ext?.toUpperCase()}
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
