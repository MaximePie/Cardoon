"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = exports.parseFile = void 0;
// Used to upload images to S3 bucket
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
const formidable_1 = __importDefault(require("formidable"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const parseFile = async (req) => {
    return new Promise((resolve, reject) => {
        const options = {
            maxFileSize: 10 * 1024 * 1024, // 10 MBs converted to bytes
            allowEmptyFiles: false,
        };
        const form = (0, formidable_1.default)(options);
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
exports.parseFile = parseFile;
const uploadImage = (file) => {
    const fileStream = fs_1.default.createReadStream(file.filepath);
    const s3 = new aws_sdk_1.default.S3({
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
exports.uploadImage = uploadImage;
