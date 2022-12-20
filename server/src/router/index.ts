import { propertyRouter } from "./property";
import { router } from "../trpc";

export const appRouter = router({
  property: propertyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
