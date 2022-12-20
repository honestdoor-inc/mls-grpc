import * as AWS from "aws-sdk";

import Axios from "axios";
import { Prisma } from "@hd/db";
import mime from "mime-types";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export async function uploadImageStream(key: string, mimeType: string, stream: Buffer) {
  return s3
    .upload({
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: `media/${key}`,
      Body: stream,
      ACL: "public-read",
      ContentType: mimeType,
    })
    .promise();
}

export async function downloadImageStream(url: string) {
  const response = await Axios.get(url, { responseType: "arraybuffer" });

  return Buffer.from(response.data, "binary");
}

export async function uploadImage(media: Prisma.MediaCreateInput) {
  const { mediaUrl, resourceRecordKey, mediaObjectId } = media;

  if (!mediaUrl) return;

  const key = [resourceRecordKey, mediaObjectId].join("/");
  const mimeType = mime.lookup(mediaUrl).toString() ?? "image/jpeg";

  const stream = await downloadImageStream(mediaUrl);

  return uploadImageStream(key, mimeType, stream);
}
