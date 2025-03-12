// Used to upload images to S3 bucket
import formidable from "formidable";
import AWS from "aws-sdk";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

export const parsefile = async (req) => {
  return new Promise((resolve, reject) => {
    let options = {
      maxFileSize: 10 * 1024 * 1024, //100 MBs converted to bytes,
      allowEmptyFiles: false,
    };

    const form = formidable(options);

    form.parse(req, (err, fields, files) => {});

    form.on("error", (error) => {
      reject(error.message);
    });

    form.on("data", (data) => {
      if (data.name === "successUpload") {
        resolve(data.value);
      }
    });
  });
};

export const uploadImage = (file) => {
  const fileStream = fs.createReadStream(file.filepath);

  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  const bucketName = process.env.AWS_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("AWS_BUCKET_NAME is missing in .env file");
  }
  const path = Date.now().toString() + file.originalFilename;
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: path,
      Body: fileStream,
      ContentType: fileStream.mimetype,
      ACL: "public-read",
    };

    s3.upload(params, (err) => {
      if (err) {
        reject(err);
      }
      const publicUrl = `https://${bucketName}.s3.eu-west-2.amazonaws.com/${Key}`;
      resolve(publicUrl);
    });
  });
};
