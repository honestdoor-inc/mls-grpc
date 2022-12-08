import * as grpc from "@grpc/grpc-js";

import { MLSClient, UpsertPropertyRequest } from "@honestdoor/proto-ts";

import { Property } from "@honestdoor/proto-ts/out/proto/generated";

const { RPC_SERVER_HOST, RPC_SERVER_PORT } = process.env;

const client = new MLSClient(
  `${RPC_SERVER_HOST}:${RPC_SERVER_PORT}`,
  grpc.ChannelCredentials.createInsecure()
);

async function run() {
  const property = Property.fromPartial({});

  const request = UpsertPropertyRequest.fromJSON({ property });

  client.upsertProperty(request, (err, response) => {
    if (err) {
      console.error(err);
    }

    console.dir(response, { depth: null });
  });
}

run();
