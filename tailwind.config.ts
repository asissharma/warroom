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
                bg: '#07070a',
                surface: '#0f0f15',
                surface2: '#161620',
                border: 'rgba(255,255,255,0.055)',
                borderHi: 'rgba(255,255,255,0.13)',
                accent: '#7c5cfc',
                acid: '#c8ff00',
                danger: '#ff3b4e',
                success: '#00e5a0',
                warning: '#ff8c00',
                info: '#38bdf8',
                text: '#eeeef5',
                muted: '#3d3d55',
                muted2: '#5c5c7a',
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
