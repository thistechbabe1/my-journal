import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/components/feedback/ToastProvider";
import LayoutWrapper from "./layout-wrapper";

export const metadata: Metadata = {
  title: "Project Sharon",
  description: "A private, beautifully crafted space for long-term reflection and intentional growth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}



