// src/utils/trpc.ts
import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "../src/router";
import chalk from "chalk";
import colorize from "json-colorizer";
import crossFetch from "cross-fetch";
import { transformer } from "./transformer";

const getBaseUrl = () => {
  return `http://localhost:4000`;
};

export const trpc = createTRPCProxyClient<AppRouter>({
  transformer,
  links: [
    loggerLink({
      enabled: (opts) =>
        process.env.NODE_ENV === "development" ||
        (opts.direction === "down" && opts.result instanceof Error),
      logger(opts) {
        const { type, path } = opts;

        if (opts.direction === "down") {
          if (opts.result instanceof Error) {
            console.error(chalk.red(`trpc:${type} => ${path} ${chalk.red(opts.result.message)}`));
          } else {
            console.log(
              chalk.magenta(`trpc:${type} => ${path} result`),
              colorize(JSON.stringify(opts.result.result), { pretty: true })
            );
          }
        } else {
          console.log(chalk.cyan(`trpc:${type} => ${path} called`));
        }
      },
    }),
    httpBatchLink({
      url: `${getBaseUrl()}/trpc`,
      fetch(input, init) {
        return crossFetch(input, {
          ...init,
          headers: {
            ...init?.headers,
            "Content-Type": "application/json",
          },
        });
      },
    }),
  ],
});

/**
 * Inference helpers for input types
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;
