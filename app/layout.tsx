import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://echoraa.life";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "echora.",
  description: "An agent that uses NVIDIA Nemotron and remembers by building.",
  openGraph: {
    title: "echora.",
    description: "An agent that uses NVIDIA Nemotron and remembers by building.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Echora rooms surrounding an absent center" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "echora.",
    description: "An agent that uses NVIDIA Nemotron and remembers by building.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
