import "~/styles/globals.css";

import type { Metadata } from "next";
import { Sora } from "next/font/google";

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
  title: "Snapthentic - fight misinformation with real humans",
  description:
    "Snapthentic is a platform that allows you to fight misinformation by verifying photos using World ID.",
  icons: [
    {
      rel: "icon",
      url: "/favicon.png",
    },
  ],
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
              <MiniKitProvider>
                <div className="min-h-screen w-full p-4 pb-24">{children}</div>
                <MobileBottomNav />
              </MiniKitProvider>
            </NextAuthProvider>
          </ErudaProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
