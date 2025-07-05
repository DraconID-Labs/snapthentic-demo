import {
  MiniKit,
  verifySiweMessage,
  type MiniAppWalletAuthSuccessPayload,
} from "@worldcoin/minikit-js";
import {
  type DefaultSession,
  type NextAuthOptions,
  getServerSession,
} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { hashNonce } from "~/utils/hash-nonce";

// USE FOR OCID
// /**
//  * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
//  * object and keep type safety.
//  *
//  * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
//  */
// declare module "next-auth" {
//   interface Session extends DefaultSession {
//     user: {
//       id: string;
//       name: string;
//     };
//   }

//   // interface User {
//   //   // ...other properties
//   //   // role: UserRole;
//   // }
// }

declare module "next-auth" {
  interface User {
    walletAddress: string;
    username: string;
    profilePictureUrl: string;
  }

  interface Session {
    user: {
      id: string;
      walletAddress: string;
      username: string;
      profilePictureUrl: string;
    } & DefaultSession["user"];
  }
}

// OCID
// export const authOptions: NextAuthOptions = {
//   callbacks: {
//     session: (params) => {
//       console.dir({ msg: "session hit", params }, { depth: null });
//       return {
//         ...params.session,
//         user: {
//           id: params.session.user.name,
//           name: params.session.user.name,
//         },
//       };
//     },
//     async signIn(params) {
//       console.dir({ msg: "params hit", params }, { depth: null });
//       return true;
//     },
//   },
//   secret: env.NEXTAUTH_SECRET,
//   providers: [
//     {
//       id: "worldcoin",
//       name: "Worldcoin",
//       type: "oauth",
//       wellKnown: "https://id.worldcoin.org/.well-known/openid-configuration",
//       authorization: { params: { scope: "openid profile email" } },
//       clientId: env.NEXT_PUBLIC_WORLDCOIN_APP_ID,
//       clientSecret: env.WORLDCOIN_APP_SECRET,
//       idToken: true,
//       checks: ["state", "nonce", "pkce"],
//       profile(profile: {
//         sub: string;
//         "https://id.worldcoin.org/v1": {
//           verification_level: VerificationLevel;
//         };
//       }) {
//         console.dir({ msg: "profile hit", profile }, { depth: null });
//         return {
//           id: profile.sub,
//           name: profile.sub,
//           verificationLevel:
//             profile["https://id.worldcoin.org/v1"].verification_level,
//         };
//       },
//     },
//   ],
//   debug: process.env.NODE_ENV === "development",
// };

// Wallet signature auth
export const walletAuthOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "World App Wallet",
      credentials: {
        nonce: { label: "Nonce", type: "text" },
        signedNonce: { label: "Signed Nonce", type: "text" },
        finalPayloadJson: { label: "Final Payload", type: "text" },
      },
      // @ts-expect-error TODO
      authorize: async ({
        nonce,
        signedNonce,
        finalPayloadJson,
      }: {
        nonce: string;
        signedNonce: string;
        finalPayloadJson: string;
      }) => {
        console.dir({
          msg: "auth start",
          nonce,
          signedNonce,
          finalPayloadJson,
        });
        const expectedSignedNonce = hashNonce({ nonce });
        console.dir({ expectedSignedNonce });

        if (signedNonce !== expectedSignedNonce) {
          console.log("Invalid signed nonce");
          return null;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const finalPayload: MiniAppWalletAuthSuccessPayload =
          JSON.parse(finalPayloadJson);
        console.log("verifyin siwe message", finalPayload, nonce);
        const result = await verifySiweMessage(finalPayload, nonce);

        if (!result.isValid || !result.siweMessageData.address) {
          console.log("Invalid final payload");
          return null;
        }
        // Optionally, fetch the user info from your own database
        const userInfo = await MiniKit.getUserInfo(finalPayload.address);

        const r = {
          id: finalPayload.address,
          ...userInfo,
        };

        console.dir({ msg: " auth result", r }, { depth: null });

        return {
          id: finalPayload.address,
          ...userInfo,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.dir({ msg: "jwt hit", token, user }, { depth: null });
      if (user) {
        token.userId = user.id;
        token.walletAddress = user.walletAddress;
        token.username = user.username;
        token.profilePictureUrl = user.profilePictureUrl;
      }

      return token;
    },
    session: async ({ session, token }) => {
      console.dir({ msg: "session hit", session, token }, { depth: null });
      if (token.userId) {
        session.user.id = token.userId as string;
        session.user.walletAddress = token.address as string;
        session.user.username = token.username as string;
        session.user.profilePictureUrl = token.profilePictureUrl as string;
      }

      return session;
    },
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(walletAuthOptions);
