import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ServiceWorkerProvider } from "@/components/service-worker-provider";
import { NotificationManager } from "@/components/notification-manager";
import { BottomNav } from "@/components/bottom-nav";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "إدارة ساعات العمل الإضافي",
  description: "تطبيق احترافي لإدارة وحساب ساعات العمل الإضافي",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <ServiceWorkerProvider>
            <NotificationManager />
            <div className="mx-auto min-h-screen max-w-md pb-20">
              {children}
              <BottomNav />
            </div>
            <Toaster
              position="top-center"
              richColors
              closeButton
              toastOptions={{
                style: {
                  direction: "rtl",
                  fontFamily: "inherit",
                },
              }}
            />
          </ServiceWorkerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
