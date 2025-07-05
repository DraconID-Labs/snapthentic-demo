import { redirect } from "next/navigation";
import { AuthWallProvider } from "~/components/auth-wall-provider";
import { api } from "~/trpc/server";

export default async function Layout({
  children,
}: { children: React.ReactNode }) {
  const profile = await api.userProfile.getMyProfile();

  if (!profile) {
    redirect("/profile/me");
  }

  return (
    <AuthWallProvider>
      <div className="mx-auto max-w-2xl space-y-8">{children}</div>
    </AuthWallProvider>
  );
}
