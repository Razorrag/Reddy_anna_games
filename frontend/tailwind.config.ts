import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Royal Indian Theme - Based on Image
        // Deep Blue/Indigo backgrounds
        royal: {
          dark: '#0A0E27',      // Deep navy/indigo - main background
          medium: '#1A1F3A',    // Medium blue - card backgrounds
          light: '#2A3154',     // Light blue - hover states
        },
        // Gold/Yellow - Primary accent (text, crowns, coins)
        gold: {
          DEFAULT: '#FFD700',   // Pure gold
          light: '#FFE55C',     // Light gold for highlights
          dark: '#B8860B',      // Dark gold for depth
          shine: '#FFF9E5',     // Gold shimmer effect
        },
        // Neon Aqua/Cyan - Interactive elements (ANDAR/BAHAR buttons)
        neon: {
          cyan: '#00F5FF',      // Bright cyan glow
          aqua: '#00E5FF',      // Aqua for buttons
          blue: '#00D4FF',      // Blue glow
        },
        // Game-specific colors
        andar: {
          DEFAULT: '#FF6B35',   // Warm orange
          dark: '#CC5529',      // Dark orange
          glow: '#FF8C5A',      // Glow effect
        },
        bahar: {
          DEFAULT: '#00E5FF',   // Cyan (matching neon)
          dark: '#00B8CC',      // Dark cyan
          glow: '#5FFFFF',      // Glow effect
        },
        // Warm earth tones (from players' clothing)
        earth: {
          orange: '#FF8C42',    // Warm orange
          maroon: '#8B2F47',    // Rich maroon
          teal: '#2A9D8F',      // Teal green
          brown: '#6B4423',     // Rich brown (poker table)
        },
        // Status colors
        success: '#10B981',     // Green for wins
        error: '#EF4444',       // Red for losses
        warning: '#F59E0B',     // Warning yellow
        
        // Shadcn UI colors (keep for component compatibility)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      backgroundImage: {
        'royal-gradient': 'linear-gradient(135deg, #0A0E27 0%, #1A1F3A 50%, #2A3154 100%)',
        'gold-gradient': 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        'neon-gradient': 'linear-gradient(135deg, #00F5FF 0%, #00E5FF 50%, #00D4FF 100%)',
        'andar-gradient': 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
        'bahar-gradient': 'linear-gradient(135deg, #00E5FF 0%, #00D4FF 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)',
        'gold-glow-strong': '0 0 30px rgba(255, 215, 0, 0.7), 0 0 60px rgba(255, 215, 0, 0.5)',
        'neon-cyan': '0 0 20px rgba(0, 245, 255, 0.6), 0 0 40px rgba(0, 245, 255, 0.4)',
        'neon-cyan-strong': '0 0 30px rgba(0, 245, 255, 0.8), 0 0 60px rgba(0, 245, 255, 0.6)',
        'andar-glow': '0 0 20px rgba(255, 107, 53, 0.5), 0 0 40px rgba(255, 107, 53, 0.3)',
        'bahar-glow': '0 0 20px rgba(0, 229, 255, 0.5), 0 0 40px rgba(0, 229, 255, 0.3)',
      },
      animation: {
        'pulse-gold': 'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-gold': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
          },
          '50%': {
            opacity: '0.8',
            boxShadow: '0 0 40px rgba(255, 215, 0, 0.8)',
          },
        },
        'pulse-neon': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 20px rgba(0, 245, 255, 0.6)',
          },
          '50%': {
            opacity: '0.8',
            boxShadow: '0 0 40px rgba(0, 245, 255, 0.9)',
          },
        },
        'shimmer': {
          '0%': {
            backgroundPosition: '-200% 0',
          },
          '100%': {
            backgroundPosition: '200% 0',
          },
        },
        'glow': {
          '0%, 100%': {
            textShadow: '0 0 10px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3)',
          },
          '50%': {
            textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.5)',
          },
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui'],
        display: ['Poppins', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;