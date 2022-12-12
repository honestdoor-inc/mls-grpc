import { Job, Queue, Worker } from "bullmq";
import { Media, Property } from "@honestdoor/proto-ts/out/proto/generated";

import { prisma } from "../clients/prisma";
import { withDefaultOpts } from "./connection";

export const propertyQueue = new Queue("property", withDefaultOpts({}));

export const propertyWorker = new Worker("property", propertyHandler, withDefaultOpts({}));

export async function propertyHandler(job: Job<Omit<Property, "media">>) {
  const children = await job.getChildrenValues();
  const media: Media[] = children[`bull:media:${job.id!!}`];

  const property = job.data;

  try {
    await prisma.property.upsert({
      where: { listingKey: property.listingKey },
      create: {
        ...property,
        media: {
          createMany: {
            data: media,
            skipDuplicates: true,
          },
        },
      },
      update: {
        ...property,
        media: {
          upsert: media.map((m) => ({
            where: { mediaKey: m.mediaKey },
            create: m,
            update: m,
          })),
        },
      },
    });
  } catch (error) {
    console.log(error);
  }

  console.log(`Processed property ${property.listingKey}`);

  return "OK";
}
