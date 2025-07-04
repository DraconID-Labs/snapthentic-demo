import type { NextAuthOptions } from "next-auth";

type WorldcoinProfile = {
  sub: string;
  verification_level: string;
  "https://id.worldcoin.org/v1": {
    verification_level: string;
  };
};

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    {
      id: "worldcoin",
      name: "Worldcoin",
      type: "oauth",
      wellKnown: "https://id.worldcoin.org/.well-known/openid-configuration",
      authorization: { params: { scope: "openid" } },
      clientId: process.env.WLD_CLIENT_ID,
      clientSecret: process.env.WLD_CLIENT_SECRET,
      idToken: true,
      checks: ["state", "nonce", "pkce"],
      profile(profile: WorldcoinProfile) {
        return {
          id: profile.sub,
          name: profile.sub,
          verificationLevel:
            profile["https://id.worldcoin.org/v1"].verification_level,
        };
      },
    },
  ],
  callbacks: {
    session: ({ session }) => {
      return session;
    },
    async signIn() {
      return true;
    },
  },
  debug: process.env.NODE_ENV === "development",
};
