import { fetcher } from "./fetcher";
import { transformer } from "./transformer";
import { trpc } from "@hd/server";
import { zod } from "@hd/db";

// const MAX = 1000;
const BATCH_SIZE = 10;

interface Replicator<T> {
  fetcher: (ctx: T) => Promise<{ ctx: T; data: any[] | null }>;
  transformer: (ctx: T, data: any) => any;
  onBatchComplete?: (ctx: T, data: any[]) => T;
}

async function replicate<T>(
  replicator: Replicator<T>,
  ctx: T extends { [key: string]: any } ? T : never
) {
  const { ctx: nextCtx, data } = await replicator.fetcher(ctx);

  if (!data?.length) return;

  const transformed = data.reduce((acc, item) => {
    const transformed = replicator.transformer(nextCtx, item);

    const property = zod.propertySchema
      .partial()
      .required({ board: true })
      .extend({ media: zod.mediaSchema.partial().array() })
      .safeParse(transformed);

    if (!property.success) {
      console.dir(property.error.errors, { depth: null });
      return acc;
    }

    acc.push(property.data);

    return acc;
  }, [] as any[]);

  await trpc.property.upsertMany.mutate(transformed);

  replicate(replicator, nextCtx as any);
}

export interface Context {
  sent: number;
  nextLink: string | null;
  batchSize: number;
}

const initialContext: Context = {
  sent: 0,
  nextLink: null,
  batchSize: BATCH_SIZE,
};

replicate<Context>(
  {
    fetcher: async (ctx) => fetcher(ctx),
    transformer: (ctx, data) => transformer(ctx, data),
    onBatchComplete: (ctx) => {
      ctx.sent += BATCH_SIZE;
      return ctx;
    },
  },
  initialContext
);
