import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ThreeBackground from "@/components/ui/ThreeBackground";
import Chatbot from "@/components/ui/Chatbot";
import PriceTicker from "@/components/ui/PriceTicker";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
 
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jay Shree Ram Group | Building Materials & Construction Logistics",
  description: "Authorized wholesale supplier of top-tier cement brands, high-tensile TMT steel, washed river sand, aggregates, and construction materials.",
  keywords: "building materials, cement supplier, TMT steel bars, sand supplier, aggregates, bricks, concrete blocks, Jalgaon, Bhadgaon, Girad",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-premium-dark text-gray-900 dark:text-gray-100 font-sans selection:bg-const-orange selection:text-white transition-colors duration-300">
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <ThreeBackground />
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
              <Chatbot />
              <PriceTicker />
              <WhatsAppButton />
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

