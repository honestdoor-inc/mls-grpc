import * as grpc from "@grpc/grpc-js";

import { CollectionOfProperty, filterBuilder } from "reso-client";
import { MLSClient, UpsertPropertyRequest } from "@honestdoor/proto-ts";

import { Keys } from "helpers/transforms";
import { fetcher } from "./fetcher";
import { pipe } from "fp-ts/lib/function";
import { propertyApi } from "./client";
import { transformer } from "./transformer";

const { RPC_SERVER_URL } = process.env;

const client = new MLSClient(RPC_SERVER_URL as string, grpc.ChannelCredentials.createInsecure());

const MAX = 50;
const BATCH_SIZE = 1;

interface Replicator<T> {
  fetcher: (ctx: T) => Promise<{ ctx: T; data: any[] | null }>;
  transformer: (ctx: T, data: any) => any;
  onBatchComplete?: (ctx: T, data: any[]) => T;
}

async function replicate<T>(replicator: Replicator<T>, ctx: T) {
  const { ctx: nextCtx, data } = await replicator.fetcher(ctx);

  if (!data?.length) return;

  const transformed = data.reduce((acc, item) => {
    const transformed = replicator.transformer(nextCtx, item);

    if (transformed) acc.push(transformed);

    return acc;
  }, [] as any[]);

  console.dir(transformed, { depth: null });

  // const request = UpsertPropertyRequest.fromPartial({
  //   property: transformed[0],
  // });

  // client.upsertProperty(request, (err, res) => {
  //   if (err) {
  //     console.log(err);
  //     return;
  //   }

  //   console.log(res);
  // });

  // replicate(replicator, nextCtx);
}

export interface Context {
  sent: number;
  nextLink: string | null;
}

const initialContext: Context = {
  sent: 0,
  nextLink: null,
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
