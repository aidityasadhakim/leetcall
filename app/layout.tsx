"use client";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

// export const metadata = {
//   metadataBase: new URL(defaultUrl),
//   title: "LeetCall",
//   description: "Practice leet code with space repetition",
// };

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

// Use a constant query client instance
const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <QueryClientProvider client={queryClient}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main className="min-h-screen">{children}</main>
          </ThemeProvider>
          <Toaster
            position="top-right"
            richColors
            closeButton
            expand={false}
            toastOptions={{
              className: "bg-background text-foreground",
              style: {
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
              },
            }}
          />
        </QueryClientProvider>
      </body>
    </html>
  );
}
