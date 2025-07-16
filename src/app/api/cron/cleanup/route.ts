import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const tmpPath = '/tmp';
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const deletedFiles: string[] = [];

  if (!fs.existsSync(tmpPath)) {
    return NextResponse.json({ message: 'No /tmp directory found' }, { status: 404 });
  }

  const sessionFolders = fs.readdirSync(tmpPath);

  for (const sessionId of sessionFolders) {
    const sessionPath = path.join(tmpPath, sessionId);

    // Only process directories
    if (!fs.statSync(sessionPath).isDirectory()) continue;

    for (const subFolder of ['input', 'output']) {
      const targetDir = path.join(sessionPath, subFolder);

      if (!fs.existsSync(targetDir)) continue;

      const files = fs.readdirSync(targetDir);
      for (const file of files) {
        const filePath = path.join(targetDir, file);
        try {
          const stats = fs.statSync(filePath);
          const age = now - stats.mtimeMs;

          if (stats.isFile() && age > oneHour) {
            fs.unlinkSync(filePath);
            deletedFiles.push(filePath);
          }
        } catch (e) {
          console.error(`Error deleting file: ${filePath}`, e);
        }
      }
    }
  }

  return NextResponse.json({
    message: 'Old files cleaned up',
    deletedFilesCount: deletedFiles.length,
    deletedFiles,
  });
}
