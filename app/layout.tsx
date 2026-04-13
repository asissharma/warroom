import type { Metadata } from 'next'
import { Instrument_Serif, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const instrument = Instrument_Serif({ weight: '400', subsets: ['latin'], variable: '--font-serif' })
const inter = Inter({ subsets: ['latin'], variable: '--font-body' })
const jbMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
    title: 'Wardroom OS',
    description: '180-Day Elite Engineering Protocol',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`${instrument.variable} ${inter.variable} ${jbMono.variable}`}>
            <body className="bg-white text-[#111111] antialiased selection:bg-black selection:text-white">
                <main className="relative">
                    {children}
                </main>
            </body>
        </html>
    )
}
