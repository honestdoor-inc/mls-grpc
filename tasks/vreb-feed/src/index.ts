import * as grpc from "@grpc/grpc-js";

import { MLSClient, UpsertPropertyRequest } from "@honestdoor/proto-ts";

import { Keys } from "helpers/transforms";
import { filterBuilder } from "reso-client";
import { pipe } from "fp-ts/lib/function";
import { propertyApi } from "./client";

const { RPC_SERVER_URL } = process.env;

const client = new MLSClient(RPC_SERVER_URL as string, grpc.ChannelCredentials.createInsecure());

const MAX = 50;
const BATCH_SIZE = 1;

async function replicate() {
  const filter = filterBuilder()
    .query("StandardStatus", "eq", "Active")
    .and("ModificationTimestamp", "gt", "2021-03-23")
    .build();

  const res = await propertyApi.propertyGet({
    $top: BATCH_SIZE,
    $filter: filter,
  });

  if (res?.data?.value?.length) {
    const transformed = pipe(
      res.data.value[0],
      Keys.replace("VIVA_", ""),
      Keys.camelCase,
      Keys.sort
    );

    console.dir(transformed, { depth: null });

    const request = UpsertPropertyRequest.fromPartial({
      property: transformed,
    });

    client.upsertProperty(request, (err, response) => {
      if (err) {
        console.error(err);
      }

      console.dir(response, { depth: null });
    });
  }
}

replicate();
