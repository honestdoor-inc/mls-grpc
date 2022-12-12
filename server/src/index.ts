import "./queues/property";
import "./queues/media";

import * as grpc from "@grpc/grpc-js";

import { MLSServer, MLSService } from "@honestdoor/proto-ts";
import { createPropertiesFlow, createPropertyFlow } from "./queues/flows";

const { RPC_SERVER_URL } = process.env;

const mlsOptsService: MLSServer = {
  upsertProperty: async (call, callback) => {
    const { property } = call.request;

    if (!property) return callback(new Error("Property is required"), { success: false });

    const propertyFlow = await createPropertyFlow(property);

    if (!propertyFlow.job)
      return callback(new Error("Failed to create property flow"), {
        success: false,
      });

    return callback(null, { success: true });
  },
  upsertProperties: async (call, callback) => {
    const { properties } = call.request;

    if (!properties) return callback(new Error("Properties are required"), { success: false });

    const propertiesFlow = await createPropertiesFlow(properties);

    if (!propertiesFlow.length)
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

      console.log(`Server running on port ${port}`);

      server.start();
    }
  );
}

startServer();
