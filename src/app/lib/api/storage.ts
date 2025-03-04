import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3 client
const s3Client = new S3Client({
  endpoint: process.env.AWS_ENDPOINT_URL,
  region: "nyc3", // Digital Ocean region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  }
});

interface UploadFileError extends Error {
  code?: string;
  message: string;
}

// Upload file function
export async function uploadFile(file: ArrayBuffer, fileName: string): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME as string, // Your bucket name
      Key: fileName,
      Body: Buffer.from(file),
      ACL: "public-read", // Makes the file publicly accessible
    });

    await s3Client.send(command);
    return fileName;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error as UploadFileError;
  }
}

// Delete file function
export async function deleteFile(fileName: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: "edith",
      Key: fileName,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error as UploadFileError;
  }
} 