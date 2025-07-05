import { AuthWallProvider } from "~/components/auth-wall-provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  console.dir("Bro please", { depth: null });

  return <AuthWallProvider>{children}</AuthWallProvider>;
}
