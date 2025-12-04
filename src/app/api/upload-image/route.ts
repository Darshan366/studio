
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with credentials from environment variables
// Next.js automatically loads variables from .env into process.env on the server-side
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: Request) {
  try {
    // Check if the credentials are even there
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error("Cloudinary credentials are not configured in environment variables.");
        return NextResponse.json({ error: 'Image upload service is not configured.' }, { status: 500 });
    }

    const { file, userId, type } = await req.json();

    if (!file || !userId || !type) {
      return NextResponse.json({ error: 'Missing file data, user ID, or upload type.' }, { status: 400 });
    }

    const isAvatar = type === 'avatar';
    const folder = isAvatar ? 'avatars' : 'covers';
    const public_id = `${folder}/${userId}`;

    // Upload the image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(file, {
      public_id: public_id,
      overwrite: true, // Replace the image if one with the same public_id already exists
      transformation: isAvatar 
        ? [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
        : [{ width: 1200, height: 400, crop: 'fill' }]
    });

    return NextResponse.json({ secure_url: uploadResponse.secure_url });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json({ error: 'Failed to upload image.' }, { status: 500 });
  }
}
