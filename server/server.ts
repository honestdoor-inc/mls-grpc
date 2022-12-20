import * as trpcExpress from "@trpc/server/adapters/express";

import { appRouter } from "./src/router";
import { createContext } from "./src/context";
import express from "express";

const app = express();

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.listen(4000, () => {
  console.log("Listening on port 4000");
});
