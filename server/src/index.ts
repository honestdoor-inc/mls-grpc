import * as grpc from "@grpc/grpc-js";

import { MLSServer, MLSService } from "@honestdoor/proto-ts";

import { logger } from "./logger";
import { propertyQueue } from "./queues/property";

const { RPC_SERVER_URL } = process.env;

const mlsOptsService: MLSServer = {
  upsertProperty: async (call, callback) => {
    const { property } = call.request;

    if (!property) return callback(new Error("Property is required"), { success: false });

    const job = await propertyQueue.add(property.listingKey!!, property);

    if (!job.id)
      return callback(new Error("Failed to create property flow"), {
        success: false,
      });

    return callback(null, { success: true });
  },
  upsertProperties: async (call, callback) => {
    const { properties } = call.request;

    if (!properties) return callback(new Error("Properties are required"), { success: false });

    const jobs = await propertyQueue.addBulk(
      properties.map((p) => ({ name: p.listingKey!!, data: p }))
    );

    if (!jobs.length)
      return callback(new Error("Failed to create properties flow"), {
        success: false,
      });

    return callback(null, { success: true });
  },
};

async function startServer() {
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

startServer();
