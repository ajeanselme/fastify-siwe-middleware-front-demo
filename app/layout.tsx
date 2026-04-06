import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Link from "next/link";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIWE Middleware Front Demo",
  description: "A demo app for siwe-middleware, showcasing the authentication flow with SIWE and JWTs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "dark",
        "antialiased",
        geistSans.variable,
        jetbrainsMono.variable,
      )}
    >
      <body>
        <div className="sm:min-h-screen flex flex-col">
          <header className="w-full h-fit  bg-surface border-b p-4 flex items-center gap-2 font-mono text-xs *:transition-colors">
            <Link href="https://antoine.sh" className="text-muted-foreground hover:text-accent">
              antoine.sh
            </Link>
            <span className="text-muted-foreground/60">/</span>
            <Link href="https://github.com/ajeanselme/fastify-siwe-middleware" className="text-muted-foreground hover:text-accent">
              siwe-middleware
            </Link>
            <span className="text-muted-foreground/60">/</span>
            <span className="text-accent font-semibold">
              front-demo
            </span>
          </header>
          <div className="flex flex-col sm:flex-row flex-1">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
