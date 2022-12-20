import { Job, Queue, Worker } from "bullmq";
import { Media, Prisma, prisma } from "@hd/db";

import { defaultOptions } from "./connection";
import { geocodeQueue } from "./geocode";
import { logger } from "../logger";
import { mediaQueue } from "./media";

type PropertyQueueData = Prisma.PropertyCreateInput & {
  media?: Prisma.MediaCreateInput[];
};

export const propertyQueue = new Queue<PropertyQueueData>("property", {
  ...defaultOptions,
  defaultJobOptions: {
    removeOnComplete: true,
  },
});

export const propertyWorker = new Worker("property", propertyHandler, {
  ...defaultOptions,
  concurrency: 5,
});

export async function propertyHandler(job: Job<PropertyQueueData>) {
  const { data } = job;

  const property = { ...data, media: undefined };

  if (!data.listingKey) {
    return logger.log({ level: "error", message: `Property ${data.id} has no listing key` });
  }

  const response = await prisma.property.upsert({
    where: { listingKey: data.listingKey },
    create: property,
    update: property,
    include: { media: true },
  });

  if (data.media?.length) {
    const newMedia = filterNewMedia(response.media, data.media);

    if (newMedia.length) {
      await mediaQueue.add("media", { propertyId: response.id, media: newMedia });
    }
  }

  if (!response.latitude || !response.longitude) {
    const { id, unparsedAddress, city, stateOrProvince, postalCode } = response;
    await geocodeQueue.add("geocode", { id, unparsedAddress, city, stateOrProvince, postalCode });
  }

  logger.log({ level: "info", message: `Processed property ${response.id}` });

  return "OK";
}

function filterNewMedia(a: Media[], b: Prisma.MediaCreateInput[]): Prisma.MediaCreateInput[] {
  return b.reduce((acc, curr) => {
    const match = a.find((m) => m.mediaKey === curr.mediaKey);

    if (!match) {
      acc.push(curr);
    }

    return acc;
  }, [] as Prisma.MediaCreateInput[]);
}
