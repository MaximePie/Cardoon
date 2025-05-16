// Used to upload images to S3 bucket
import formidable from "formidable";
import AWS from "aws-sdk";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

export const parseFile = async (req: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    const options: formidable.Options = {
      maxFileSize: 10 * 1024 * 1024, // 10 MBs converted to bytes
      allowEmptyFiles: false,
    };

    const form = formidable(options);

    form.parse(
      req,
      (
        err: Error | null,
        fields: formidable.Fields,
        files: formidable.Files
      ) => {
        if (err) {
          reject(err.message);
        }
      }
    );

    form.on("error", (error: Error) => {
      reject(error.message);
    });

    form.on("data", (data: { name: string; value: string }) => {
      if (data.name === "successUpload") {
        resolve(data.value);
      }
    });
  });
};

export const uploadImage = (file: {
  filepath: string;
  originalFilename: string;
}): Promise<string> => {
  const fileStream = fs.createReadStream(file.filepath);

  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    region: process.env.AWS_REGION as string,
  });

  const bucketName = process.env.AWS_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("AWS_BUCKET_NAME is missing in .env file");
  }
  const path = Date.now().toString() + file.originalFilename;
  return new Promise((resolve, reject) => {
    const params: AWS.S3.PutObjectRequest = {
      Bucket: bucketName,
      Key: path,
      Body: fileStream,
      ContentType: "application/octet-stream", // Default content type
      // ACL: "public-read",
    };

    s3.upload(params, (err: Error, data: AWS.S3.ManagedUpload.SendData) => {
      if (err) {
        reject(err);
      }
      const publicUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${path}`;
      resolve(publicUrl);
    });
  });
};
