import { AuthWallProvider } from "~/components/auth-wall-provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthWallProvider>
      <div className="mx-auto max-w-2xl space-y-8">{children}</div>
    </AuthWallProvider>
  );
}
