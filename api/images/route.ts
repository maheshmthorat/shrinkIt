import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json(
      { error: "No session cookie found" },
      { status: 400 }
    );
  }

  const inputPath = path.join("/tmp", sessionId, "input");
  const outputPath = path.join("/tmp", sessionId, "output");

  if (!fs.existsSync(outputPath)) {
    return NextResponse.json(
      { error: "No compressed images for this session" },
      { status: 404 }
    );
  }

  const files = fs.readdirSync(outputPath).map((file) => {
    const compressedFile = path.join(outputPath, file);
    const originalFile = path.join(inputPath, file);

    const compressedSize = fs.existsSync(compressedFile)
      ? fs.statSync(compressedFile).size
      : 0;

    const originalSize = fs.existsSync(originalFile)
      ? fs.statSync(originalFile).size
      : 0;

    // Read file as base64
    const compressedBase64 = fs.existsSync(compressedFile)
      ? `data:image/${path.extname(file).replace(".", "")};base64,${fs
          .readFileSync(compressedFile)
          .toString("base64")}`
      : "";

    const originalBase64 = fs.existsSync(originalFile)
      ? `data:image/${path.extname(file).replace(".", "")};base64,${fs
          .readFileSync(originalFile)
          .toString("base64")}`
      : "";

    return {
      filename: file,
      originalSize,
      compressedSize,
      originalBase64,
      compressedBase64,
    };
  });

  return NextResponse.json({
    images: files,
    zipUrl: `/api/download?sessionId=${sessionId}`,
  });
}
