import { ConnectionOptions, QueueOptions } from "bullmq";

export const connectionOpts: ConnectionOptions = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT as string),
};

export const defaultOptions: QueueOptions = {
  connection: connectionOpts,
};
