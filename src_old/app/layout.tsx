import type { Metadata } from "next";
import { Inter, Space_Grotesk, DM_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
    variable: "--font-sys",
    subsets: ["latin"],
    weight: ["500", "700"],
});

const dmMono = DM_Mono({
    variable: "--font-mono",
    subsets: ["latin"],
    weight: ["400", "500"],
});

export const metadata: Metadata = {
    title: "Learning OS V4",
    description: "Pastel Adaptive Core",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${spaceGrotesk.variable} ${dmMono.variable} antialiased font-body`}>
                {children}
            </body>
        </html>
    );
}
