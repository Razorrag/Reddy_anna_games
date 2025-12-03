/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Royal Theme Colors
        royal: {
          darkest: '#0A0E27',
          darker: '#141B3D',
          dark: '#1E2749',
          medium: '#2C3A67',
          light: '#3D4E7C',
          lighter: '#4F6191',
        },
        gold: {
          darkest: '#8B7500',
          darker: '#B8990D',
          DEFAULT: '#FFD700',
          light: '#FFE44D',
          lighter: '#FFF299',
          lightest: '#FFFBCC',
        },
        // Semantic Colors
        success: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#F87171',
          dark: '#DC2626',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          dark: '#2563EB',
        },
        // Card Suit Colors
        cardSuit: {
          red: '#DC2626',
          black: '#1F2937',
        },
        // Betting Colors
        andar: {
          DEFAULT: '#EF4444',
          light: '#FCA5A5',
          dark: '#B91C1C',
        },
        bahar: {
          DEFAULT: '#3B82F6',
          light: '#93C5FD',
          dark: '#1E40AF',
        },
        // Earth tone colors for game table
        earth: {
          brown: '#6B4423',
          maroon: '#8B3A3A',
          teal: '#2C7A7B',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      backgroundImage: {
        'royal-gradient': 'linear-gradient(135deg, #0A0E27 0%, #1E2749 100%)',
        // Premium Metallic Gold: Dark Gold -> Bright Gold -> Dark Gold (Metallic luster)
        'premium-gold': 'linear-gradient(to bottom, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C)',
        // Simplified Gold for smaller elements
        'gold-gradient': 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        'card-gradient': 'linear-gradient(135deg, #2C3A67 0%, #1E2749 100%)',
        'andar-gradient': 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        'bahar-gradient': 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
        // Glossy overlay for buttons
        'glass-shine': 'linear-gradient(rgba(255,255,255,0.15), rgba(255,255,255,0))',
        'premium-royal': 'linear-gradient(135deg, #141B3D 0%, #1E2749 100%)',
      },
      boxShadow: {
        'gold': '0 4px 14px 0 rgba(255, 215, 0, 0.39)',
        'gold-lg': '0 10px 40px 0 rgba(255, 215, 0, 0.5)',
        // Premium glow effects
        'glow-gold': '0 0 15px rgba(255, 215, 0, 0.6), inset 0 0 10px rgba(255, 215, 0, 0.4)',
        'glow-royal': '0 0 15px rgba(10, 14, 39, 0.8), inset 0 0 20px rgba(0, 0, 0, 0.5)',
        'gold-glow': '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)',
        'gold-glow-strong': '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.5)',
        'gold-shine': '0 0 5px rgba(255, 215, 0, 0.8)',
        'royal': '0 4px 14px 0 rgba(45, 55, 72, 0.6)',
        'royal-lg': '0 10px 40px 0 rgba(45, 55, 72, 0.8)',
        'neon-gold': '0 0 5px theme("colors.gold.DEFAULT"), 0 0 20px theme("colors.gold.DEFAULT")',
        'neon-blue': '0 0 5px theme("colors.info.DEFAULT"), 0 0 20px theme("colors.info.DEFAULT")',
        'neon-cyan': '0 0 20px rgba(0, 245, 255, 0.6), 0 0 40px rgba(0, 245, 255, 0.4)',
        'neon-cyan-strong': '0 0 30px rgba(0, 245, 255, 0.9), 0 0 60px rgba(0, 245, 255, 0.6)',
        'andar-glow': '0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.3)',
        'bahar-glow': '0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.3)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'pulse-neon': 'pulseNeon 1.5s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
        'shine': 'shine 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-in',
        'fade-in': 'fadeIn 0.3s ease-in',
        'fade-out': 'fadeOut 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.2s ease-in',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'flip': 'flip 0.6s ease-in-out',
        'card-deal': 'cardDeal 0.5s ease-out',
        'win-celebration': 'winCelebration 0.8s ease-out',
      },
      keyframes: {
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px theme("colors.gold.DEFAULT"), 0 0 20px theme("colors.gold.DEFAULT")' },
          '50%': { boxShadow: '0 0 20px theme("colors.gold.DEFAULT"), 0 0 40px theme("colors.gold.DEFAULT")' },
        },
        pulseGold: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        pulseNeon: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-100%)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
        cardDeal: {
          '0%': {
            transform: 'translateX(-200px) translateY(-100px) rotate(-45deg)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateX(0) translateY(0) rotate(0deg)',
            opacity: '1',
          },
        },
        winCelebration: {
          '0%': {
            transform: 'scale(0.5) rotate(-45deg)',
            opacity: '0',
          },
          '50%': {
            transform: 'scale(1.2) rotate(5deg)',
            opacity: '1',
          },
          '100%': {
            transform: 'scale(1) rotate(0deg)',
            opacity: '1',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}