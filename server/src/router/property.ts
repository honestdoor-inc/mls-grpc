import { publicProcedure, router } from "../trpc";

import { logger } from "../logger";
import { propertyQueue } from "../queues/property";
import { zod } from "@hd/db";

export const propertyRouter = router({
  upsertOne: publicProcedure
    .input(
      zod.propertySchema
        .partial()
        .required({ board: true })
        .extend({ media: zod.mediaSchema.partial().array() })
    )
    .mutation(async ({ input }) => {
      const job = await propertyQueue.add("property", input);

      if (!job.id) {
        logger.log({ level: "error", message: `Failed to add job to queue` });
        return { success: false, error: "Failed to add job to queue" };
      }

      return { success: true };
    }),
  upsertMany: publicProcedure
    .input(
      zod.propertySchema
        .partial()
        .required({ board: true })
        .extend({ media: zod.mediaSchema.partial().array() })
        .array()
    )
    .mutation(async ({ input }) => {
      const jobs = await propertyQueue.addBulk(
        input.map((property) => ({ name: "property", data: property }))
      );

      if (!jobs.length) {
        logger.log({ level: "error", message: `Failed to add jobs to queue` });
        return { success: false, error: "Failed to add jobs to queue" };
      }

      return { success: true };
    }),
});
