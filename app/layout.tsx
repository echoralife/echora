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
    images: [{
      url: "/echora-mascot-card-20260910.png",
      width: 2172,
      height: 724,
      alt: "Echora carrying a new room through its growing structure",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "echora.",
    description: "An agent that uses NVIDIA Nemotron and remembers by building.",
    images: ["/echora-mascot-card-20260910.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
