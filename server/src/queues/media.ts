import { Job, Queue, Worker } from "bullmq";

import { Media } from "@honestdoor/proto-ts/out/proto/generated";
import { prisma } from "../clients/prisma";
import { withDefaultOpts } from "./connection";

export const mediaQueue = new Queue("media", withDefaultOpts({}));

export const mediaWorker = new Worker("media", mediaHandler, withDefaultOpts({}));

export async function mediaHandler(job: Job<Media[]>): Promise<Media[]> {
  console.log(`Processing media for property ${job.parent?.id}`);

  const media = job.data;

  if (!media?.length) return [];

  for (const m of media) {
    m.mediaUrl = "https://www.test.com";
  }

  return media;
}
