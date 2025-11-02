// Used to upload images to S3 bucket
import AWS from "aws-sdk";
import dotenv from "dotenv";
import formidable from "formidable";
import fs from "fs";
dotenv.config();
export const parseFile = async (req) => {
    return new Promise((resolve, reject) => {
        const options = {
            maxFileSize: 10 * 1024 * 1024, // 10 MBs converted to bytes
            allowEmptyFiles: false,
        };
        const form = formidable(options);
        form.parse(req, (err, fields, files) => {
            if (err) {
                reject(err.message);
            }
        });
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
    const safeName = (file.originalFilename || "avatar.jpg")
        .replace(/[^\w.\-]/g, "_")
        .slice(-128);
    const path = Date.now().toString() + safeName;
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: bucketName,
            Key: path,
            Body: fileStream,
            ContentType: file.contentType || "application/octet-stream",
            // ACL: "public-read",
        };
        s3.upload(params, (err, data) => {
            if (err) {
                reject(err);
            }
            const publicUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${path}`;
            resolve(publicUrl);
        });
    });
};
