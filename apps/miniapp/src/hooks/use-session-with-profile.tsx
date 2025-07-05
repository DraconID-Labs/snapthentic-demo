import type { UserProfile } from "@snapthentic/database/schema";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";

type SessionWithProfile =
  | {
      status: "loading" | "unauthenticated";
    }
  | {
      status: "authenticated";
      profile: UserProfile;
      session: Session;
    };

export function useSessionWithProfile(): SessionWithProfile {
  const session = useSession();

  const profile = api.userProfile.me.useQuery();

  if (session.status === "loading" || profile.isLoading) {
    return { status: "loading" };
  }

  if (session.status === "authenticated" && session.data && profile.data) {
    return {
      status: session.status,
      session: session.data,
      profile: profile.data,
    };
  }

  return { status: "unauthenticated" };
}
