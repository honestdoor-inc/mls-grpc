import { Job, Queue, Worker } from "bullmq";
import { Prisma, prisma } from "@hd/db";

import { defaultOptions } from "./connection";
import { logger } from "../logger";
import { uploadImage } from "../@hd/utils";

const isDev = process.env.NODE_ENV === "development";

type MediaQueueData = {
  propertyId: string;
  media: Prisma.MediaCreateInput[];
};

export const mediaQueue = new Queue<MediaQueueData>("media", {
  ...defaultOptions,
  defaultJobOptions: {
    removeOnComplete: true,
  },
});

export const mediaWorker = new Worker("media", mediaHandler, {
  ...defaultOptions,
  concurrency: 5,
});

export async function mediaHandler(job: Job<MediaQueueData>) {
  const { propertyId, media } = job.data;

  if (!media.length) return;

  // Skip s3 upload in development
  if (isDev) {
    await prisma.media.createMany({
      data: media.map((m) => ({
        propertyId,
        ...m,
      })),
      skipDuplicates: true,
    });

    return "OK";
  }

  const nMedia = await Promise.all(
    media.map(async (m) => {
      if (m.mediaUrl) {
        const upload = await uploadImage(m);

        if (upload) {
          m.mediaUrl = `https://cdn.honestdoor.com/${upload.Key}`;

          return m;
        }
      }

      return m;
    })
  );

  await prisma.media.createMany({
    data: nMedia.map((m) => ({
      propertyId,
      ...m,
    })),
    skipDuplicates: true,
  });

  logger.log({ level: "info", message: `Processed media for property ${propertyId}` });

  return "OK";
}
