import { AuthWallProvider } from "~/components/auth-wall-provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthWallProvider>{children}</AuthWallProvider>;
}
