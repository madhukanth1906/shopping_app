import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('image');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/assets/hero-saree.png
    const filepath = path.join(process.cwd(), 'public', 'assets', 'hero-saree.png');
    await writeFile(filepath, buffer);
    console.log(`Updated hero image at ${filepath}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error uploading hero image:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
