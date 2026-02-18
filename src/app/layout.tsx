import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { ReactNode } from "react";
import { IBM_Plex_Sans } from "next/font/google";

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Convos",
  description: "Social + Language learning",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={plex.variable}>
      <body className="font-[var(--font-sans)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
