/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
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
        // Royal theme colors
        royal: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce', // Primary royal purple
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Primary gold
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      // Modern shadows with depth
      boxShadow: {
        // Royal themed shadows
        'royal-sm': '0 2px 8px -2px rgba(126, 34, 206, 0.2)',
        'royal': '0 10px 40px -10px rgba(126, 34, 206, 0.4)',
        'royal-lg': '0 20px 60px -15px rgba(126, 34, 206, 0.5)',
        'royal-xl': '0 30px 80px -20px rgba(126, 34, 206, 0.6)',
        
        // Gold themed shadows
        'gold-sm': '0 2px 8px -2px rgba(245, 158, 11, 0.2)',
        'gold': '0 8px 32px -8px rgba(245, 158, 11, 0.3)',
        'gold-lg': '0 16px 48px -12px rgba(245, 158, 11, 0.4)',
        
        // Depth shadows
        'deep': '0 20px 60px -15px rgba(0, 0, 0, 0.5)',
        'deep-lg': '0 30px 80px -20px rgba(0, 0, 0, 0.6)',
        
        // Glow effects
        'glow': '0 0 30px rgba(126, 34, 206, 0.6)',
        'glow-sm': '0 0 15px rgba(126, 34, 206, 0.4)',
        'glow-lg': '0 0 50px rgba(126, 34, 206, 0.8)',
        'glow-gold': '0 0 30px rgba(245, 158, 11, 0.6)',
        'glow-gold-lg': '0 0 50px rgba(245, 158, 11, 0.8)',
        
        // Inner glow
        'inner-glow': 'inset 0 0 20px rgba(126, 34, 206, 0.3)',
        'inner-glow-gold': 'inset 0 0 20px rgba(245, 158, 11, 0.3)',
        
        // Multi-layer (premium feel)
        'premium': '0 10px 40px -10px rgba(126, 34, 206, 0.4), 0 0 30px rgba(126, 34, 206, 0.3)',
        'premium-gold': '0 8px 32px -8px rgba(245, 158, 11, 0.3), 0 0 25px rgba(245, 158, 11, 0.2)',
      },
      // Backdrop blur (glassmorphism)
      backdropBlur: {
        'xs': '2px',
        'md': '12px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px',
      },
      // Modern animations
      animation: {
        // Fade animations
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-fast': 'fadeIn 0.3s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-in-out',
        
        // Slide animations
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'slide-left': 'slideLeft 0.5s ease-out',
        'slide-right': 'slideRight 0.5s ease-out',
        
        // Scale animations
        'scale-in': 'scaleIn 0.3s ease-out',
        'scale-out': 'scaleOut 0.3s ease-out',
        'scale-pulse': 'scalePulse 2s ease-in-out infinite',
        
        // Rotate animations
        'rotate-slow': 'rotate 3s linear infinite',
        'rotate-fast': 'rotate 1s linear infinite',
        
        // Pulse animations
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        
        // Glow animations
        'glow': 'glow 2s ease-in-out infinite',
        'glow-fast': 'glow 1s ease-in-out infinite',
        'glow-gold': 'glowGold 2s ease-in-out infinite',
        
        // Shimmer animations (loading states)
        'shimmer': 'shimmer 2s linear infinite',
        'shimmer-fast': 'shimmer 1s linear infinite',
        
        // Bounce animations
        'bounce-slow': 'bounce 2s infinite',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        
        // Wiggle animations
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'wiggle-slow': 'wiggle 2s ease-in-out infinite',
        
        // Spin animations
        'spin-slow': 'spin 3s linear infinite',
        'spin-reverse': 'spinReverse 1s linear infinite',
        
        // Float animations
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        
        // Background animations
        'gradient': 'gradient 3s ease infinite',
        'gradient-slow': 'gradient 6s ease infinite',
      },
      keyframes: {
        // Fade keyframes
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        
        // Slide keyframes
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        
        // Scale keyframes
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.9)', opacity: '0' },
        },
        scalePulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        
        // Rotate keyframes
        rotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        spinReverse: {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        
        // Glow keyframes
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(126, 34, 206, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(126, 34, 206, 0.8)' },
        },
        glowGold: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(245, 158, 11, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(245, 158, 11, 0.8)' },
        },
        
        // Shimmer keyframes
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        
        // Bounce keyframes
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        
        // Wiggle keyframes
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        
        // Float keyframes
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        
        // Gradient keyframes
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      // Typography enhancements
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
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
      // Spacing enhancements
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      // Border width
      borderWidth: {
        '3': '3px',
      },
      // Z-index
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}