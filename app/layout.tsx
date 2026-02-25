import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
    title: 'INTEL·OS',
    description: '180-day operational learning system',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            </head>
            <body className="font-body antialiased selection:bg-accent/30 content-z flex flex-col min-h-screen">
                <Nav />
                <main className="flex-1 pt-6 overflow-x-hidden">
                    {children}
                </main>
            </body>
        </html>
    )
}
