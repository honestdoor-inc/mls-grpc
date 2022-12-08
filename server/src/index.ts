import * as grpc from "@grpc/grpc-js";

import { MLSServer, MLSService } from "@honestdoor/proto-ts";

const { RPC_SERVER_HOST, RPC_SERVER_PORT } = process.env;

const mlsOptsService: MLSServer = {
  upsertProperty: (call, callback) => {
    const { request } = call;

    console.dir(request.property, { depth: null });

    return callback(null, { success: true });
  },
};

async function startServer() {
  const server = new grpc.Server();

  server.addService(MLSService, mlsOptsService);

  server.bindAsync(
    `${RPC_SERVER_HOST}:${RPC_SERVER_PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error(err);
      }

      console.log(`Server running on port ${port}`);

      server.start();
    }
  );
}

startServer();
