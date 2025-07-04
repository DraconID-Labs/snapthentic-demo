import "~/styles/globals.css";

import type { Metadata } from "next";
import { Sora } from "next/font/google";

import { AuthWallProvider } from "~/components/auth-wall-provider";
import { ErudaProvider } from "~/components/eruda/eruda-provider";
import MiniKitProvider from "~/components/minikit-provider";
import MobileBottomNav from "~/components/mobile-bottom-nav";
import NextAuthProvider from "~/components/next-auth-provider";
import { TRPCReactProvider } from "~/trpc/react";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Miniapp Template",
  description: "Miniapp Template",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`font-sans ${sora.variable}`}>
      <body className="w-screen">
        <TRPCReactProvider>
          <ErudaProvider>
            <NextAuthProvider>
              <AuthWallProvider>
                <MiniKitProvider>
                  <div className="min-h-screen w-full p-4 pb-24">
                    {children}
                  </div>
                  <MobileBottomNav />
                </MiniKitProvider>
              </AuthWallProvider>
            </NextAuthProvider>
          </ErudaProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
