import { Job, Queue, Worker } from "bullmq";
import { Media, Property } from "@honestdoor/proto-ts/out/proto/generated";

import { Media as PMedia } from "database";
import { defaultOptions } from "./connection";
import { geocodeQueue } from "./geocode";
import { logger } from "../logger";
import { mediaQueue } from "./media";
import { prisma } from "../clients/prisma";

export const propertyQueue = new Queue<Property>("property", {
  ...defaultOptions,
  defaultJobOptions: {
    removeOnComplete: true,
  },
});

export const propertyWorker = new Worker("property", propertyHandler, {
  ...defaultOptions,
  concurrency: 5,
});

function getNewMedia(a: PMedia[], b: Media[]): Media[] {
  return b.reduce((acc, curr) => {
    const match = a.find((m) => m.mediaKey === curr.mediaKey);

    if (!match) {
      acc.push(curr);
    }

    return acc;
  }, [] as Media[]);
}

export async function propertyHandler(job: Job<Property>) {
  const { data } = job;

  const property = { ...data, media: undefined };

  const response = await prisma.property.upsert({
    where: { listingKey: data.listingKey },
    create: property,
    update: property,
    include: { media: true },
  });

  if (data.media?.length) {
    const newMedia = getNewMedia(response.media, data.media);

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
