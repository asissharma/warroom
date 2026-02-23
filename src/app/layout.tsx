import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Antigravity Protocol",
  description: "6-Month Master Plan Execution Engine",
  manifest: "/manifest.json",
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main className="app-container">
          {children}
        </main>
      </body>
    </html>
  );
}
