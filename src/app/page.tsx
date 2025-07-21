"use client";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import ImageWithLoader from "./components/ImageWithLoader";
import Shimmer from "./components/Shimmer";
import Image from "next/image";

type ImageResult = {
  filename: string;
  originalBase64: string;
  compressedBase64: string;
  originalSize: number;
  compressedSize: number;
};

export default function Home() {
  const localUrl = "/api";
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [results, setResults] = useState<ImageResult[]>([]);
  const [zipUrl, setZipUrl] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (
    e: React.FormEvent<HTMLFormElement> | React.ChangeEvent<HTMLInputElement>
  ) => {
    e.preventDefault?.();
    e.preventDefault();
    setActionLoading(true);

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
    setResults((prev) => [...data.images, ...prev]);
    setZipUrl(data.zipUrl || zipUrl);
    setActionLoading(false);
    setError(null);
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
        setResults((prev) => [...data.images, ...prev]);
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

    fetch(`${localUrl}/images?sessionId=${sessionId}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.images) {
          setResults(data.images);
          if (data.zipUrl) setZipUrl(data.zipUrl);
        }

        if (data?.error) {
          setError(data?.error);
        }
      })
      .catch((err) => {
        console.error("Error loading images:", err.message);
      })
      .finally(() => {
        setLoading(false);
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
    totalOriginal > 0
      ? Math.round(Math.abs((totalSaved / totalOriginal) * 100))
      : 0;
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <section className="max-w-4xl mx-auto text-center mb-10">
        <h1 className="text-3xl font-bold text-center mb-6">
          ShrinkIt - Image Compressor
        </h1>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          ✨ Why use ShrinkIt?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
          <div className="bg-white p-4 rounded shadow">
            📦 Compress JPEG, PNG, SVG, GIF
          </div>
          <div className="bg-white p-4 rounded shadow">
            ⚡ Instant image preview & size stats
          </div>
          <div className="bg-white p-4 rounded shadow">
            📉 Save up to 80% size
          </div>
          <div className="bg-white p-4 rounded shadow">
            🧠 Smart image compression with Sharp
          </div>
          <div className="bg-white p-4 rounded shadow">
            ⬇️ Bulk upload & zip download support
          </div>
          <div className="bg-white p-4 rounded shadow">
            🆓 100% Free & works in your browser
          </div>
        </div>
      </section>

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
      <div className="mt-10 bg-gray-50 rounded-xl shadow-lg p-4 sm:p-6 max-w-screen-lg mx-auto">
        <div className="">
          {error && (
            <div className="text-red-600 bg-red-100 p-2 rounded">{error}</div>
          )}

          {loading ? (
            <div className="space-y-4 mt-4">
              <Shimmer />
              <Shimmer />
              <Shimmer />
              <Shimmer />
            </div>
          ) : (
            <>
              {results.length > 0 && (
                <>
                  <div className="space-y-4 mt-4">
                    <div className="bg-gray-900 text-white text-center py-4 rounded-lg shadow mb-6">
                      <h2 className="text-xl font-bold text-green-400">
                        🎉 ShrinkIt just saved you {averageSavedPercent}%!
                      </h2>
                      <p className="text-sm text-gray-300">
                        {results.length} image{results.length > 1 ? "s" : ""}{" "}
                        optimized | {Math.round(totalSaved / 1024)} KB total
                        saved
                      </p>
                    </div>
                    {actionLoading && <Shimmer />}

                    {results.map((item, idx) => {
                      const originalKB = item.originalSize / 1024;
                      const compressedKB = item.compressedSize / 1024;
                      const percentSaved =
                        originalKB > 0
                          ? Math.round(
                              Math.abs(
                                ((originalKB - compressedKB) / originalKB) * 100
                              )
                            )
                          : 0;

                      const ext = item.filename
                        ?.split(".")
                        .pop()
                        ?.toLowerCase();

                      return (
                        <div
                          key={idx}
                          className="bg-white rounded-lg shadow px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 "
                        >
                          <div className="flex items-center gap-4">
                            <ImageWithLoader
                              src={`${item.compressedBase64}`}
                              alt="Thumbnail"
                              className="w-20 h-20 rounded object-cover border"
                            />
                            <div className="flex flex-col gap-2">
                              <p className="font-medium text-sm text-gray-800 break-all">
                                {item.filename}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-600 font-semibold text-xs px-3 py-1 rounded flex items-center gap-1">
                                  {ext?.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 text-sm text-gray-700 w-full sm:w-auto">
                            <div className="flex justify-between items-center gap-2">
                              <div>
                                <strong>Original:</strong>{" "}
                                {originalKB.toFixed(0)} KB
                              </div>
                              <a
                                href={item.compressedBase64}
                                download
                                className="bg-blue-100 hover:bg-blue-200 text-blue-600 font-semibold text-xs px-4 py-2 rounded flex items-center gap-1 w-max"
                              >
                                <Image
                                  alt="file"
                                  src="/file.svg"
                                  width={18}
                                  height={16}
                                />
                                {ext?.toUpperCase()}
                              </a>
                            </div>
                            <div className="flex justify-between items-center gap-2">
                              <div>
                                <strong>Compressed:</strong>{" "}
                                {compressedKB.toFixed(0)} KB
                              </div>
                              <span className="text-xs text-green-800 bg-green-100 px-3 py-1.5 rounded-full font-bold text-center w-max">
                                {percentSaved > 0
                                  ? `Saved ${percentSaved.toFixed(0)}%`
                                  : `+${Math.abs(percentSaved).toFixed(
                                      0
                                    )}% larger`}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="flex items-center mb-6">
                      {zipUrl && (
                        <a
                          href={`/api/download?sessionId=${sessionId}`}
                          download
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                          Download all images
                        </a>
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <footer className="mt-16 text-center text-sm text-gray-500 py-6">
        <hr className="mb-4 border-gray-300" />
        <p>
          © {new Date().getFullYear()} | By{" "}
          <span className="font-medium">Mahesh Mohan Thorat</span> — Made with{" "}
          <span className="text-red-500">❤</span> in India 🇮🇳
        </p>
      </footer>
    </div>
  );
}
