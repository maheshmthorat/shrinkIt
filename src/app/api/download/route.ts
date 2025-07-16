import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');
  if (!sessionId) {
    return new NextResponse('Missing sessionId', { status: 400 });
  }

  const outputPath = path.join('/tmp', sessionId, 'output');
  const zipPath = path.join('/tmp', sessionId, 'compressed.zip');

  if (!fs.existsSync(outputPath)) {
    return new NextResponse('No compressed files found', { status: 404 });
  }

  if (!fs.existsSync(path.join('/tmp', sessionId))) {
    fs.mkdirSync(path.join('/tmp', sessionId), { recursive: true });
  }

  await new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', resolve);
    archive.on('error', reject);

    archive.pipe(output);
    archive.directory(outputPath + '/', false);
    archive.finalize();
  });

  const zipBuffer = fs.readFileSync(zipPath);

  return new NextResponse(zipBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${sessionId}-compressed.zip"`,
    },
  });
}
