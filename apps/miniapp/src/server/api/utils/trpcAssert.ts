import { TRPCError } from "@trpc/server";
import { type TRPC_ERROR_CODE_KEY } from "@trpc/server/unstable-core-do-not-import";

export function trpcAssert(
  condition: unknown,
  code?: TRPC_ERROR_CODE_KEY,
  message?: string,
): asserts condition {
  if (!condition) {
    throw new TRPCError({
      code: code ?? "INTERNAL_SERVER_ERROR",
      message: message ?? "Assertion failed",
    });
  }
}
