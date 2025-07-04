import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { env } from "~/env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(file: Buffer) {
  const result = await new Promise<UploadApiResponse | undefined>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream((error, uploadResult) => {
          if (error) {
            reject(new Error("Failed to upload file"));
          } else {
            resolve(uploadResult);
          }
        })
        .end(file);
    },
  );

  return result;
}
