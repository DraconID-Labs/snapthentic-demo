import NextAuth from "next-auth";

import { walletAuthOptions } from "~/server/auth";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const handler = NextAuth(walletAuthOptions);
export { handler as GET, handler as POST };
