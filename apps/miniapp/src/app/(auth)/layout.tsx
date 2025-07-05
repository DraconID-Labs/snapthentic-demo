import { AuthWallProvider } from "~/components/auth-wall-provider";
import MiniKitProvider from "~/components/minikit-provider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthWallProvider>
      <MiniKitProvider>{children}</MiniKitProvider>
    </AuthWallProvider>
  );
}
