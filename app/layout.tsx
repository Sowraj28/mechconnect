import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import MechBot from "./components/MechBot";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "MechConnect - Find Sewage & Septic Tank Cleaning Services",
  description:
    "India's leading platform to connect with verified sewage and septic tank cleaning professionals near you.",
  keywords:
    "sewage cleaning, septic tank, drainage cleaning, sewage truck, India",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased bg-gray-50`}
      >
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              success: { style: { background: "#7c3aed", color: "#fff" } },
              error: { style: { background: "#dc2626", color: "#fff" } },
            }}
          />
          <MechBot />
        </Providers>
      </body>
    </html>
  );
}
