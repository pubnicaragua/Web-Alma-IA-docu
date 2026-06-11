import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeColorsProvider } from "@/lib/theme-colors";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/middleware/auth-provider";
import { UserProvider } from "@/middleware/user-context";
import ClientWrapper from "@/components/ClientWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Alma IA",
  description: "Plataforma de gestión educativa con inteligencia artificial",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <ThemeColorsProvider>
            <AuthProvider>
              <UserProvider>
                <ClientWrapper>{children}</ClientWrapper>
                <Toaster />
              </UserProvider>
            </AuthProvider>
          </ThemeColorsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
