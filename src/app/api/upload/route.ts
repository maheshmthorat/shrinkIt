import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const formData = await req.formData();
  const files = formData.getAll("images") as File[];

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
  }

  const resultList = await Promise.all(
    files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadsDir = path.join(process.cwd(), "public", "uploads", sessionId);
      const originalDir = path.join(uploadsDir, "original");
      const compressedDir = path.join(uploadsDir, "compressed");

      await fs.mkdir(originalDir, { recursive: true });
      await fs.mkdir(compressedDir, { recursive: true });

      const fileExt = path.extname(file.name);
      const baseName = `${Date.now()}-${uuidv4()}${fileExt}`;

      const originalPath = path.join(originalDir, baseName);
      const compressedPath = path.join(compressedDir, baseName);

      await fs.writeFile(originalPath, buffer);

      await sharp(buffer)
        .jpeg({ quality: 60 }) 
        .toFile(compressedPath);

      const originalSize = buffer.length;
      const compressedBuffer = await fs.readFile(compressedPath);
      const compressedSize = compressedBuffer.length;

      return {
        filename: file.name,
        originalUrl: `/../uploads/${sessionId}/original/${baseName}`,
        compressedUrl: `/../uploads/${sessionId}/compressed/${baseName}`,
        originalSize,
        compressedSize,
      };
    })
  );

  return NextResponse.json({
    images: resultList,
    zipUrl: null, // Skipped for now
  });
}
