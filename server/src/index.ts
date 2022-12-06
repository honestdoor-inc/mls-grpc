import * as grpc from "grpc";

import { IMLSServer, MLSService } from "@honestdoor/proto-ts";

import { upsertProperty } from "./funcs";

const host = "0.0.0.0:9090";

const mlsOptsService: IMLSServer = {
  upsertProperty,
};

const server = new grpc.Server();

server.addService(MLSService, mlsOptsService);

server.bind(host, grpc.ServerCredentials.createInsecure());

server.start();
