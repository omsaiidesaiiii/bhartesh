import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folderName = formData.get('folderName') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!folderName) {
      return NextResponse.json({ error: 'No folder name provided' }, { status: 400 });
    }

    // Create unique filename with timestamp
    const timestamp = Date.now();
    const originalName = file.name;
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const fileName = `${sanitizedBaseName}_${timestamp}${extension}`;

    // Define the upload path
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folderName);
    const filePath = path.join(uploadDir, fileName);

    // Create directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true });

    // Convert file to buffer and write to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return the public URL
    const fileUrl = `/uploads/${folderName}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: fileName,
      originalName: originalName,
      size: file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Configure file size limit (15MB)
export const config = {
  api: {
    bodyParser: false,
  },
};
