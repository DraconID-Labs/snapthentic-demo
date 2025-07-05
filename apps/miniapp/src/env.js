import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    NEXTAUTH_SECRET: z.string(),
    WORLDCOIN_APP_SECRET: z.string(),
    REGISTRY_ADDRESS: z.string(),
    CALLER_PRIVATE_KEY: z.string(),
    RPC_URL: z.string(),
    SUPABASE_URL: z.string(),
    SUPABASE_KEY: z.string(),
    SUPABASE_BUCKET: z.string(),
  },
  client: {},
  shared: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_NODE_ENV: z
      .enum(["development", "production"])
      .default("development"),
    NEXT_PUBLIC_WORLDCOIN_APP_ID: z
      .string()
      .refine((value) => value.startsWith("app_"), {
        message: "String must start with 'app'",
      }),
  },
  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_WORLDCOIN_APP_ID: process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID,
    WORLDCOIN_APP_SECRET: process.env.WORLDCOIN_APP_SECRET,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    REGISTRY_ADDRESS: process.env.REGISTRY_ADDRESS,
    CALLER_PRIVATE_KEY: process.env.CALLER_PRIVATE_KEY,
    RPC_URL: process.env.RPC_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
    SUPABASE_BUCKET: process.env.SUPABASE_BUCKET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
