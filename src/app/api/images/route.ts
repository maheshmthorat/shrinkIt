import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'No session cookie found' }, { status: 400 });
  }

  const inputPath = path.join(process.cwd(), 'public/uploads', sessionId, 'original');
  const outputPath = path.join(process.cwd(), 'public/uploads', sessionId, 'compressed');
  const zipPath = path.join(process.cwd(), 'public/uploads', sessionId, 'compressed.zip');

  if (!fs.existsSync(outputPath)) {
    return NextResponse.json({ error: 'No compressed images for this session' }, { status: 404 });
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

    return {
      filename: file,
      originalUrl: `/../uploads/${sessionId}/original/${file}`,
      compressedUrl: `/../uploads/${sessionId}/compressed/${file}`,
      originalSize,
      compressedSize,
    };
  });

  return NextResponse.json({
    images: files,
    zipUrl: fs.existsSync(zipPath) ? `/tmp/${sessionId}/compressed.zip` : null,
  });
}
