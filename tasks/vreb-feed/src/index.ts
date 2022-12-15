import * as grpc from "@grpc/grpc-js";

import { MLSClient, UpsertPropertiesRequest } from "@honestdoor/proto-ts";

import { fetcher } from "./fetcher";
import { transformer } from "./transformer";

const { RPC_SERVER_URL } = process.env;

const client = new MLSClient(RPC_SERVER_URL as string, grpc.ChannelCredentials.createInsecure());

// const MAX = 1000;
const BATCH_SIZE = 50;

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

    if (transformed) acc.push(transformed);

    return acc;
  }, [] as any[]);

  const request = UpsertPropertiesRequest.fromPartial({
    properties: transformed,
  });

  client.upsertProperties(request, (err, res) => {
    if (err) {
      console.log(err);
      return;
    }
  });

  // replicate(replicator, nextCtx);
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
