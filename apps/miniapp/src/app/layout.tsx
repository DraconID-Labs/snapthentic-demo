import "~/styles/globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { ErudaProvider } from "~/componenets/eruda/eruda-provider";
import NextAuthProvider from "~/componenets/next-auth-provider";
import MiniKitProvider from "~/componenets/minikit-provider";
import { AuthWallProvider } from "~/componenets/auth-wall-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
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
    <html lang="en" className={`font-sans ${inter.variable} bg-white`}>
      <body className="w-screen">
        <TRPCReactProvider>
          <ErudaProvider>
            <NextAuthProvider>
              <AuthWallProvider>
                <MiniKitProvider>{children}</MiniKitProvider>
              </AuthWallProvider>
            </NextAuthProvider>
          </ErudaProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
