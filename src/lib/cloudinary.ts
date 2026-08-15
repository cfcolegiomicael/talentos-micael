import "server-only";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadProfilePhoto(
  buffer: Buffer,
  mimeType: string,
  userId: string
) {
  const base64 = buffer.toString("base64");
  const result = await cloudinary.uploader.upload(
    `data:${mimeType};base64,${base64}`,
    {
      folder: `waldorf-talentos/perfis/${userId}`,
      resource_type: "image",
      transformation: [{ width: 1600, height: 1600, crop: "limit" }],
    }
  );
  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteCloudinaryImage(publicId: string) {
  await cloudinary.uploader.destroy(publicId);
}
