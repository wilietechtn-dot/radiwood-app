
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

import SiteChrome from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "RadiWood — Bois d'Olivier",
  description:
    "Créations artisanales tunisiennes en bois d'olivier.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
