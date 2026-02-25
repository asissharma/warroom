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
                s2: '#161620',
                accent: '#7c5cfc',
                acid: '#c8ff00',
                danger: '#ff3b4e',
                success: '#00e5a0',
                warning: '#ff8c00',
                info: '#38bdf8',
                text: '#eeeef5',
                muted: '#3d3d55',
                muted2: '#5c5c7a',
                border: 'rgba(255,255,255,0.055)',
                borderHi: 'rgba(255,255,255,0.13)'
            },
            fontFamily: {
                display: ['Bebas Neue', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
                body: ['Outfit', 'sans-serif']
            }
        },
    },
    plugins: [],
};

export default config;
