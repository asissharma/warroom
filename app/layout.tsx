import type { Metadata } from 'next'
import { Bebas_Neue, Outfit, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-body' })
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
        <html lang="en" className={`${bebas.variable} ${outfit.variable} ${jbMono.variable}`}>
            <body className="bg-black text-white h-[100dvh] overflow-hidden flex flex-col antialiased">
                <main className="flex-1 overflow-y-auto overflow-x-hidden relative min-h-0 hide-scrollbar">
                    <div className="relative z-10 min-h-full flex flex-col">
                        {children}
                    </div>
                </main>
            </body>
        </html>
    )
}
