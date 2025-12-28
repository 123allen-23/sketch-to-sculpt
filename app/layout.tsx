import "./globals.css";
import { Inter } from "next/font/google";
import NavBar from "@/components/NavBar";

export const metadata = {
  title: "Sketch→Sculpt",
  description: "From sketch to sculpture. Transform original art into refined and 3D-ready forms.",
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavBar />
        <main style={{ minHeight: "100vh" }}>{children}</main>
      </body>
    </html>
  );
}
