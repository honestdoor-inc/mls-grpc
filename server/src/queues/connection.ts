import { ConnectionOptions, QueueOptions } from "bullmq";

export const connectionOpts: ConnectionOptions = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT as string),
};

export function withDefaultOpts<T extends QueueOptions>(
  opts: T
): T & { connection: ConnectionOptions } {
  return {
    ...opts,
    connection: connectionOpts,
    defaultJobOptions: { removeOnComplete: true },
  };
}
