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
                // ── COMMAND LAYER (Premium Dark Glassmorphism) ────────────────
                bg: '#050505',
                surface: 'rgba(255, 255, 255, 0.03)',
                surface2: 'rgba(255, 255, 255, 0.06)',
                border: 'rgba(255, 255, 255, 0.06)',
                borderLo: 'rgba(255, 255, 255, 0.04)',
                borderHi: 'rgba(255, 255, 255, 0.12)',
                accent: '#38bdf8', // Neon blue
                success: '#34d399',
                danger: '#f87171',
                text: '#f8fafc',
                muted: '#94a3b8',
                muted2: '#475569',

                // ── BRAIN LAYER ────────────────────────────────────────────
                // The sidebar. Deep space — absorbs everything, lets color speak.
                'brain-void': '#0c0a1e',  // Near-black deep indigo
                'brain-surface': '#13112a',  // Cards on the dark sidebar
                'brain-border': 'rgba(255,255,255,0.06)',  // Subtle dividers in dark

                // Canvas (main content area) — slightly cooler than Command
                'brain-canvas': '#f8f7ff',  // Ice white — just distinct enough
                'brain-card': '#ffffff',
                'brain-line': 'rgba(12, 10, 30, 0.06)',  // Table row dividers

                // ── COLLECTION COLORS — each color IS the identity ─────────
                // Questions: Electric indigo — precision, mastery, depth
                'q-base': '#4f46e5',
                'q-glow': '#818cf8',
                'q-muted': '#e0e7ff',

                // Projects: Deep ember — building, fire, output
                'p-base': '#ea580c',
                'p-glow': '#fb923c',
                'p-muted': '#ffedd5',

                // Syllabus: Forest emerald — growth, reading, cultivation
                's-base': '#059669',
                's-glow': '#34d399',
                's-muted': '#d1fae5',

                // Skills: Vivid violet — human power, deep practice
                'sk-base': '#7c3aed',
                'sk-glow': '#a78bfa',
                'sk-muted': '#ede9fe',

                // Tech Spine: Cyan electric — technical, precise, cold logic
                'sp-base': '#0891b2',
                'sp-glow': '#22d3ee',
                'sp-muted': '#cffafe',

                // Courses: Magenta — discovery, curation, energy
                'c-base': '#db2777',
                'c-glow': '#f472b6',
                'c-muted': '#fce7f3',

                // Survival: Blood red — urgency, stakes, non-negotiable
                'sv-base': '#dc2626',
                'sv-glow': '#f87171',
                'sv-muted': '#fee2e2',
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
                'slide-in-right': 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                'palette-in': 'paletteIn 0.18s ease-out',
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
                },
                slideInRight: {
                    '0%': { transform: 'translateX(16px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                paletteIn: {
                    '0%': { transform: 'scale(0.97) translateY(-4px)', opacity: '0' },
                    '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
                },
            }
        },
    },
    plugins: [],
};

export default config;
