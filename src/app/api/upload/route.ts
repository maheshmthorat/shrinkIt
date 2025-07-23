import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId") || uuidv4();
  const formData = await req.formData();
  const files = formData.getAll("images") as File[];

  if (!files.length) {
    return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
  }

  const tmpSessionDir = path.join("/tmp", sessionId);
  const inputDir = path.join(tmpSessionDir, "input");
  const outputDir = path.join(tmpSessionDir, "output");

  // Ensure /tmp/session/input & output directories exist
  if (!existsSync(inputDir)) await fs.mkdir(inputDir, { recursive: true });
  if (!existsSync(outputDir)) await fs.mkdir(outputDir, { recursive: true });

  const resultList = await Promise.all(
    files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileExt = path.extname(file.name);
      const filename = `${Date.now()}-${uuidv4()}${fileExt}`;

      const originalPath = path.join(inputDir, filename);
      const compressedPath = path.join(outputDir, filename);

      // Save original
      await fs.writeFile(originalPath, buffer);

      // Compress
      await sharp(buffer).jpeg({ quality: 50 }).toFile(compressedPath);

      const compressedBuffer = await fs.readFile(compressedPath);

      return {
        filename,
        originalSize: buffer.length,
        compressedSize: compressedBuffer.length,
        // These won't be public URLs, but just for your frontend to show previews
        originalBase64: `data:image/${fileExt.replace(
          ".",
          ""
        )};base64,${buffer.toString("base64")}`,
        compressedBase64: `data:image/${fileExt.replace(
          ".",
          ""
        )};base64,${compressedBuffer.toString("base64")}`,
      };
    })
  );

  return NextResponse.json({
    images: resultList,
    zipUrl: `/api/download?sessionId=${sessionId}`,
  });
}
