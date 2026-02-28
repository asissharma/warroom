// ── FILE: tailwind.config.ts ──
import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: '#faf9f6',      // Off-white/warm
                surface: '#ffffff', // Pure white
                surface2: '#f3f0f5',// Soft lavender-grey
                border: 'rgba(74, 78, 105, 0.08)', // Softened dark semi-transparent colors
                borderHi: 'rgba(74, 78, 105, 0.15)',// Slightly stronger border
                accent: '#a2d2ff',  // Pastel blue
                acid: '#ffc8dd',    // Pastel pink/action 
                danger: '#ffadad',  // Pastel red
                success: '#caffbf', // Pastel green
                warning: '#fdffb6', // Pastel yellow
                info: '#9bf6ff',    // Pastel cyan
                text: '#4a4e69',    // Dark pastel slate/purple, softer than black
                muted: '#9a8c98',   // Medium pastel grey
                muted2: '#c9ada7',  // Light text
            },
            fontFamily: {
                bebas: ['Bebas Neue', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
                body: ['Outfit', 'sans-serif'],
                display: ['Bebas Neue', 'sans-serif'],
            },
            animation: {
                'slide-in-top': 'slideInTop 0.2s ease-out',
                'fade-in': 'fadeIn 0.2s ease-out',
                'pulse-dot': 'pulseDot 2s cubic-bezier(0.4,0,0.6,1) infinite',
            },
            keyframes: {
                slideInTop: {
                    '0%': { transform: 'translateY(-8px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                pulseDot: {
                    '0%,100%': { opacity: '1' },
                    '50%': { opacity: '0.4' },
                }
            }
        },
    },
    plugins: [],
};

export default config;
