import type { Metadata } from "next";
import { I18nProvider } from "@/lib/i18n";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { VisitTracker } from "@/components/auth/VisitTracker";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SilverIce Toolbox",
    template: "%s | SilverIce Toolbox"
  },
  description: "Local-first tools and study resources for developers.",
  metadataBase: new URL("https://toolbox.silvericekey.fun")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <I18nProvider>
          <VisitTracker />
          <Header />
          {children}
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
