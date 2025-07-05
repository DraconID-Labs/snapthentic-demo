import {
  createCallerFactory,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { contestsRouter } from "./routers/contests";
import { followsRouter } from "./routers/follows";
import { likesRouter } from "./routers/likes";
import { proofsRouter } from "./routers/proofs";
import { snapsRouter } from "./routers/snaps";
import { userProfileRouter } from "./routers/userProfile";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  hello: publicProcedure.query(() => "Hello World"),
  helloPrivate: protectedProcedure.query(() => "Hello World"),
  userProfile: userProfileRouter,
  proofs: proofsRouter,
  snaps: snapsRouter,
  likes: likesRouter,
  follows: followsRouter,
  contests: contestsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
