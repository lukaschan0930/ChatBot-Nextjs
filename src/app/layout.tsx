import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/app/components/ui/toaster";
import { ToastProvider } from "@/app/components/ui/toast";
import { Provider } from "@/app/hooks/provider";
import { AuthProvider } from "@/app/context/AuthContext";
import { AdminProvider } from "@/app/context/AdminContext";
import { Provider as JotaiProvider } from "jotai";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "E.D.I.T.H",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/image/favicon.png" />
      </head>
      <body
        className={`antialiased bg-[#000000] ${inter.className}`}
      >
        <JotaiProvider>
          <Provider>
            <AuthProvider>
              <AdminProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
                <Toaster />
              </AdminProvider>
            </AuthProvider>
          </Provider>
        </JotaiProvider>
      </body>
    </html>
  );
}
