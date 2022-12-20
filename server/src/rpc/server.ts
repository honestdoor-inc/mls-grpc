import * as grpc from "@grpc/grpc-js";

import { MLSServer, MLSService } from "@honestdoor/proto-ts";
import { upsertProperties, upsertProperty } from "../rpc";

import { logger } from "../logger";

const { RPC_SERVER_URL } = process.env;

const mlsOptsService: MLSServer = {
  upsertProperty,
  upsertProperties,
};

export async function startServer() {
  const server = new grpc.Server();

  server.addService(MLSService, mlsOptsService);

  server.bindAsync(
    RPC_SERVER_URL as string,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error(err);
      }

      logger.log({ level: "info", message: `Server running on port ${port}` });

      server.start();
    }
  );
}
