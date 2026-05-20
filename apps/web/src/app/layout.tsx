import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI Engineer Toolbox",
    template: "%s | AI Engineer Toolbox"
  },
  description: "Local-first tools and study resources for AI application engineers.",
  metadataBase: new URL("https://toolbox.silvericekey.fun")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
