import type { VerificationLevel } from "@worldcoin/minikit-js";
import {
  type DefaultSession,
  type NextAuthOptions,
  getServerSession,
} from "next-auth";
import { env } from "~/env";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name: string;
    };
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: (params) => {
      return {
        ...params.session,
        user: {
          id: params.session.user.name,
          name: params.session.user.name,
        },
      };
    },
    async signIn() {
      return true;
    },
  },
  secret: env.NEXTAUTH_SECRET,
  providers: [
    {
      id: "worldcoin",
      name: "Worldcoin",
      type: "oauth",
      wellKnown: "https://id.worldcoin.org/.well-known/openid-configuration",
      authorization: { params: { scope: "openid" } },
      clientId: env.NEXT_PUBLIC_WORLDCOIN_APP_ID,
      clientSecret: env.WORLDCOIN_APP_SECRET,
      idToken: true,
      checks: ["state", "nonce", "pkce"],
      profile(profile: {
        sub: string;
        "https://id.worldcoin.org/v1": {
          verification_level: VerificationLevel;
        };
      }) {
        return {
          id: profile.sub,
          name: profile.sub,
          verificationLevel:
            profile["https://id.worldcoin.org/v1"].verification_level,
        };
      },
    },
  ],
  debug: process.env.NODE_ENV === "development",
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
