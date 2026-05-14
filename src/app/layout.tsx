import type { Metadata } from "next";
import "../styles/global.scss";
import styles from "./App.module.scss";
import { Footer } from "../components/Footer/Footer";
import { Header } from "../components/Header/Header";
import { MobileBottomNav } from "../components/MobileBottomNav/MobileBottomNav";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "ТДА - торговый дом Адам, кованые изделия, ворота и надежные решения для дома",
  description:
    "Кованые ворота, ограждения, металлические элементы, краски и фурнитура для частного дома и участка.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    title: "ТДА - торговый дом Адам",
    description:
      "Кованые ворота, ограждения, металлические элементы, краски и фурнитура для частного дома и участка.",
    siteName: "ТДА",
    images: [
      {
        url: "/favicon.png",
        width: 512,
        height: 512,
        alt: "ТДА",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "ТДА - торговый дом Адам",
    description:
      "Кованые ворота, ограждения, металлические элементы, краски и фурнитура для частного дома и участка.",
    images: ["/favicon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <Providers>
          <div className={styles.page}>
            <Header />
            <main className={styles.main}>{children}</main>
            <Footer />
            <MobileBottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}