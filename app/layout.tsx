import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import Providers from "./providers";
import "./globals.css";
import type { Locale } from "@/lib/types";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "BlackBox Court - Pre-trade gate - Bitget Trading Infra",
  description: "One POST before your bot executes. Policy gate, Bitget market evidence, paper position snapshot, and audit export."
};

const themeBootScript = `(function(){try{var t=localStorage.getItem("blackbox-court-theme");if(t==="light"||t==="bitget"||t==="dark"){document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t==="light"?"light":"dark";}var l=localStorage.getItem("blackbox-court-locale");if(l==="zh"||l==="en")document.documentElement.lang=l;}catch(e){}})();`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const initialLocale: Locale = cookieStore.get("blackbox-court-locale")?.value === "zh" ? "zh" : "en";

  return (
    <html className={inter.variable} data-theme="dark" lang={initialLocale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body suppressHydrationWarning>
        <Providers initialLocale={initialLocale}>{children}</Providers>
      </body>
    </html>
  );
}
