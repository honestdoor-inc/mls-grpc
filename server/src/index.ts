import * as grpc from "grpc";

import { IMLSOptsServer, MLSOptsService } from "@honestdoor/proto-ts";

import { createPost } from "./funcs";

const host = "0.0.0.0:9090";

const mlsOptsService: IMLSOptsServer = {
  createPost,
};

const server = new grpc.Server();

server.addService(MLSOptsService, mlsOptsService);

server.bind(host, grpc.ServerCredentials.createInsecure());

server.start();
