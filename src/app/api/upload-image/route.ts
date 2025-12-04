
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: Request) {
  try {
    const { file, userId } = await req.json();

    if (!file || !userId) {
      return NextResponse.json({ error: 'Missing file data or user ID.' }, { status: 400 });
    }

    // Upload the image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(file, {
      public_id: `avatars/${userId}`, // Store in an 'avatars' folder with the user's ID as the public_id
      overwrite: true, // Replace the image if one with the same public_id already exists
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' }
      ]
    });

    return NextResponse.json({ secure_url: uploadResponse.secure_url });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json({ error: 'Failed to upload image.' }, { status: 500 });
  }
}

    