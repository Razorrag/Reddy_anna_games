
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
        // Royal Theme Colors (referenced in index.css)
        royal: {
          dark: '#0A0E27',      // Main background
          medium: '#1A1F3A',    // Card backgrounds
          light: '#2A3154',     // Borders and accents
        },
        gold: {
          DEFAULT: '#FFD700',   // Primary gold
          light: '#FFA500',     // Light gold/orange
        },
        'neon-cyan': '#00F5FF',
        
        // Ultra Dark Casino Theme - Almost Black Base
        casino: {
          black: '#000000',
          darkest: '#0a0a0a',
          darker: '#0d1015',
          dark: '#121820',
          medium: '#1a2228',
        },
        // Metallic Dark Green - Shiny & Professional
        metallic: {
          green: {
            darkest: '#0a1f12',      // Very dark metallic green
            darker: '#0f2817',       // Dark metallic green
            dark: '#14331d',         // Medium dark with metallic sheen
            base: '#1a4d2e',         // Base metallic green
            light: '#236d3f',        // Lighter metallic green
            shine: '#2d8f52',        // Shiny metallic highlight
            glow: '#34a85e',         // Glowing metallic accent
          },
        },
        // Electric Blue & Glow Colors - Next Level Theme
        glow: {
          // Electric Dark Blue - Primary Color
          blue: '#0066FF',
          'blue-light': '#1a7aff',
          'blue-dark': '#0052cc',
          'blue-metallic': '#0059e6',  // Metallic blue variant
          // Emerald Green Accent - Complements Blue
          emerald: '#10b981',
          'emerald-dark': '#059669',
          'emerald-light': '#34d399',
          // Teal Accent - Bridge between blue and green
          teal: '#14b8a6',
          'teal-dark': '#0d9488',
          'teal-light': '#2dd4bf',
          // Purple Accent
          purple: '#6366F1',
          'purple-light': '#818CF8',
          // Violet Accent
          violet: '#8B5CF6',
          'violet-light': '#A78BFA',
          // Pink Accent
          pink: '#EC4899',
          'pink-light': '#F472B6',
          // Gold Accent
          gold: '#F59E0B',
          'gold-light': '#FBBF24',
        },
        // Multi-color Gradient Stops for Premium Headings
        gradient: {
          blue: '#0066FF',
          emerald: '#10b981',
          teal: '#14b8a6',
          purple: '#8B5CF6',
          pink: '#EC4899',
          gold: '#F59E0B',
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
        // Ultra Dark Backgrounds
        'ultra-dark': 'linear-gradient(135deg, #000000 0%, #0a0a0a 100%)',
        'dark-casino': 'linear-gradient(135deg, #0d1015 0%, #121820 100%)',
        
        // Metallic Dark Green Gradients - Shiny & Fluid
        'metallic-green': 'linear-gradient(135deg, #0a1f12 0%, #14331d 50%, #1a4d2e 100%)',
        'metallic-green-shine': 'linear-gradient(135deg, #0f2817 0%, #1a4d2e 50%, #236d3f 100%)',
        'metallic-green-glow': 'linear-gradient(135deg, #14331d 0%, #1a4d2e 40%, #2d8f52 70%, #34a85e 100%)',
        'metallic-green-fluid': 'linear-gradient(90deg, #0a1f12 0%, #1a4d2e 25%, #236d3f 50%, #1a4d2e 75%, #0a1f12 100%)',
        
        // Electric Blue Glow Gradients
        'electric-blue': 'linear-gradient(135deg, #0052cc 0%, #0066FF 50%, #1a7aff 100%)',
        'electric-blue-metallic': 'linear-gradient(135deg, #0052cc 0%, #0059e6 50%, #0066FF 100%)',
        
        // Blue + Green Professional Combinations
        'blue-emerald': 'linear-gradient(135deg, #0066FF 0%, #14b8a6 50%, #10b981 100%)',
        'blue-teal': 'linear-gradient(135deg, #0066FF 0%, #14b8a6 100%)',
        'emerald-blue': 'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #0066FF 100%)',
        'metallic-electric': 'linear-gradient(135deg, #1a4d2e 0%, #0066FF 50%, #2d8f52 100%)',
        
        // Purple + Green Combinations
        'purple-emerald': 'linear-gradient(135deg, #6366F1 0%, #14b8a6 50%, #10b981 100%)',
        'violet-teal': 'linear-gradient(135deg, #8B5CF6 0%, #14b8a6 100%)',
        
        // Rainbow Glow Gradient for Premium Headings (with Green)
        'rainbow-glow': 'linear-gradient(90deg, #0066FF 0%, #14b8a6 20%, #10b981 40%, #8B5CF6 60%, #EC4899 80%, #F59E0B 100%)',
        'rainbow-metallic': 'linear-gradient(90deg, #0066FF 0%, #1a4d2e 25%, #2d8f52 50%, #8B5CF6 75%, #0066FF 100%)',
        
        // Premium Professional Gradients
        'blue-purple-pink': 'linear-gradient(135deg, #0066FF 0%, #8B5CF6 50%, #EC4899 100%)',
        'blue-emerald-gold': 'linear-gradient(135deg, #0066FF 0%, #10b981 50%, #F59E0B 100%)',
        'emerald-purple-gold': 'linear-gradient(135deg, #10b981 0%, #8B5CF6 50%, #F59E0B 100%)',
        
        // Button Gradients - Electric Blue + Metallic Green
        'btn-electric': 'linear-gradient(135deg, #0052cc 0%, #0066FF 100%)',
        'btn-emerald': 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        'btn-metallic': 'linear-gradient(135deg, #1a4d2e 0%, #2d8f52 100%)',
        'btn-blue-emerald': 'linear-gradient(135deg, #0066FF 0%, #10b981 100%)',
        'btn-multi': 'linear-gradient(135deg, #0066FF 0%, #14b8a6 50%, #8B5CF6 100%)',
        
        // Game specific
        'andar-gradient': 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        'bahar-gradient': 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
        
        // Glossy overlay with metallic shine
        'glass-shine': 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%)',
        'metallic-shine': 'linear-gradient(135deg, rgba(45, 143, 82, 0.2) 0%, rgba(26, 77, 46, 0.1) 50%, rgba(10, 31, 18, 0) 100%)',
      },
      boxShadow: {
        // Electric Blue Glows - Primary Theme
        'glow-blue': '0 0 10px rgba(0, 102, 255, 0.5), 0 0 20px rgba(0, 102, 255, 0.3)',
        'glow-blue-md': '0 0 15px rgba(0, 102, 255, 0.6), 0 0 30px rgba(0, 102, 255, 0.4)',
        'glow-blue-lg': '0 0 20px rgba(0, 102, 255, 0.7), 0 0 40px rgba(0, 102, 255, 0.5)',
        'glow-blue-xl': '0 0 30px rgba(0, 102, 255, 0.8), 0 0 60px rgba(0, 102, 255, 0.6), 0 0 90px rgba(0, 102, 255, 0.4)',
        
        // Emerald Green Glows - Professional Accent
        'glow-emerald': '0 0 10px rgba(16, 185, 129, 0.5), 0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-emerald-md': '0 0 15px rgba(16, 185, 129, 0.6), 0 0 30px rgba(16, 185, 129, 0.4)',
        'glow-emerald-lg': '0 0 20px rgba(16, 185, 129, 0.7), 0 0 40px rgba(16, 185, 129, 0.5)',
        
        // Teal Glows - Bridge Color
        'glow-teal': '0 0 10px rgba(20, 184, 166, 0.5), 0 0 20px rgba(20, 184, 166, 0.3)',
        'glow-teal-md': '0 0 15px rgba(20, 184, 166, 0.6), 0 0 30px rgba(20, 184, 166, 0.4)',
        'glow-teal-lg': '0 0 20px rgba(20, 184, 166, 0.7), 0 0 40px rgba(20, 184, 166, 0.5)',
        
        // Metallic Green Glows - Shiny Subtle
        'glow-metallic': '0 0 10px rgba(45, 143, 82, 0.4), 0 0 20px rgba(26, 77, 46, 0.3)',
        'glow-metallic-md': '0 0 15px rgba(45, 143, 82, 0.5), 0 0 30px rgba(26, 77, 46, 0.4)',
        'glow-metallic-lg': '0 0 20px rgba(52, 168, 94, 0.6), 0 0 40px rgba(45, 143, 82, 0.5)',
        
        // Purple Glows
        'glow-purple': '0 0 10px rgba(99, 102, 241, 0.5), 0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-purple-md': '0 0 15px rgba(99, 102, 241, 0.6), 0 0 30px rgba(99, 102, 241, 0.4)',
        'glow-purple-lg': '0 0 20px rgba(99, 102, 241, 0.7), 0 0 40px rgba(99, 102, 241, 0.5)',
        
        // Violet Glows
        'glow-violet': '0 0 10px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-violet-md': '0 0 15px rgba(139, 92, 246, 0.6), 0 0 30px rgba(139, 92, 246, 0.4)',
        
        // Pink Accent Glows
        'glow-pink': '0 0 10px rgba(236, 72, 153, 0.5), 0 0 20px rgba(236, 72, 153, 0.3)',
        'glow-pink-md': '0 0 15px rgba(236, 72, 153, 0.6), 0 0 30px rgba(236, 72, 153, 0.4)',
        
        // Professional Multi-color Glows
        'glow-multi': '0 0 10px rgba(0, 102, 255, 0.4), 0 0 20px rgba(20, 184, 166, 0.3), 0 0 30px rgba(139, 92, 246, 0.2)',
        'glow-rainbow': '0 0 15px rgba(0, 102, 255, 0.4), 0 0 30px rgba(16, 185, 129, 0.3), 0 0 45px rgba(139, 92, 246, 0.2), 0 0 60px rgba(236, 72, 153, 0.1)',
        'glow-professional': '0 0 10px rgba(0, 102, 255, 0.4), 0 0 20px rgba(16, 185, 129, 0.3), 0 0 30px rgba(45, 143, 82, 0.2)',
        
        // Inner glows for ultra-dark cards
        'inner-glow-blue': 'inset 0 0 30px rgba(0, 102, 255, 0.1)',
        'inner-glow-emerald': 'inset 0 0 30px rgba(16, 185, 129, 0.08)',
        'inner-glow-metallic': 'inset 0 0 30px rgba(45, 143, 82, 0.08)',
        'inner-glow-multi': 'inset 0 0 30px rgba(0, 102, 255, 0.08), inset 0 0 20px rgba(16, 185, 129, 0.05)',
        
        // Premium 3D effects with professional glows
        'ultra-3d': '0 20px 50px -10px rgba(0, 0, 0, 0.7), 0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 102, 255, 0.3)',
        'ultra-3d-emerald': '0 20px 50px -10px rgba(0, 0, 0, 0.7), 0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.3)',
        'floating': '0 30px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 102, 255, 0.4)',
        'floating-emerald': '0 30px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(16, 185, 129, 0.4)',
        
        // Metallic sheen effects
        'metallic-sheen': '0 4px 6px -1px rgba(45, 143, 82, 0.1), 0 2px 4px -1px rgba(26, 77, 46, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'metallic-elevated': '0 10px 15px -3px rgba(45, 143, 82, 0.15), 0 4px 6px -2px rgba(26, 77, 46, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        
        // Game specific glows
        'andar-glow': '0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.3)',
        'bahar-glow': '0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.3)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-neon': 'pulseNeon 1.5s ease-in-out infinite',
        'neon-pulse': 'neonPulse 2s ease-in-out infinite',
        'neon-flicker': 'neonFlicker 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
        'shine': 'shine 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'glow-electric': 'glowElectric 2s ease-in-out infinite',
        'glow-emerald': 'glowEmerald 2s ease-in-out infinite',
        'glow-metallic': 'glowMetallic 3s ease-in-out infinite',
        'rainbow-shift': 'rainbowShift 8s linear infinite',
        'metallic-flow': 'metallicFlow 4s ease-in-out infinite',
        'fluid-gradient': 'fluidGradient 6s ease-in-out infinite',
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
        // Legacy Animations
        'card-fly': 'cardFly 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'confetti-fall': 'confettiFall 3s linear forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'scale-rotate': 'scaleRotate 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'chip-fly': 'chipFly 0.8s ease-out forwards',
        'card-flip': 'cardFlip 0.6s ease-in-out',
        'timer-urgent': 'timerUrgent 1s infinite',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
      },
      keyframes: {
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 255, 209, 0.5), 0 0 20px rgba(0, 255, 209, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 255, 209, 0.8), 0 0 40px rgba(0, 255, 209, 0.5)' },
        },
        glowElectric: {
          '0%, 100%': { 
            boxShadow: '0 0 10px rgba(0, 102, 255, 0.5), 0 0 20px rgba(0, 102, 255, 0.3)',
            filter: 'brightness(1)'
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(0, 102, 255, 0.8), 0 0 40px rgba(0, 102, 255, 0.6), 0 0 60px rgba(0, 102, 255, 0.4)',
            filter: 'brightness(1.2)'
          },
        },
        glowEmerald: {
          '0%, 100%': { 
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.5), 0 0 20px rgba(16, 185, 129, 0.3)',
            filter: 'brightness(1)'
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.8), 0 0 40px rgba(16, 185, 129, 0.6)',
            filter: 'brightness(1.15)'
          },
        },
        glowMetallic: {
          '0%, 100%': { 
            boxShadow: '0 0 10px rgba(45, 143, 82, 0.4), 0 0 20px rgba(26, 77, 46, 0.3)',
            filter: 'brightness(1) saturate(1)'
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(52, 168, 94, 0.6), 0 0 40px rgba(45, 143, 82, 0.5)',
            filter: 'brightness(1.15) saturate(1.2)'
          },
        },
        rainbowShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        metallicFlow: {
          '0%, 100%': { 
            backgroundPosition: '0% 50%',
            filter: 'brightness(1) saturate(1)'
          },
          '25%': { 
            backgroundPosition: '25% 50%',
            filter: 'brightness(1.1) saturate(1.1)'
          },
          '50%': { 
            backgroundPosition: '50% 50%',
            filter: 'brightness(1.2) saturate(1.2)'
          },
          '75%': { 
            backgroundPosition: '75% 50%',
            filter: 'brightness(1.1) saturate(1.1)'
          },
        },
        fluidGradient: {
          '0%, 100%': { 
            backgroundPosition: '0% 50%',
            backgroundSize: '200% 200%'
          },
          '50%': { 
            backgroundPosition: '100% 50%',
            backgroundSize: '200% 200%'
          },
        },
        neonPulse: {
          '0%, 100%': {
            filter: 'brightness(1)',
            boxShadow: '0 0 5px currentColor, 0 0 20px currentColor'
          },
          '50%': {
            filter: 'brightness(1.3)',
            boxShadow: '0 0 10px currentColor, 0 0 40px currentColor, 0 0 60px currentColor'
          },
        },
        neonFlicker: {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: '1' },
          '20%, 24%, 55%': { opacity: '0.7' },
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
        // Legacy Animation Keyframes
        cardFly: {
          '0%': {
            transform: 'translateY(-100vh) rotate(0deg) scale(0.5)',
            opacity: '0',
          },
          '50%': {
            transform: 'translateY(0) rotate(180deg) scale(1.2)',
            opacity: '1',
          },
          '100%': {
            transform: 'translateY(0) rotate(360deg) scale(1)',
            opacity: '1',
          },
        },
        confettiFall: {
          '0%': {
            transform: 'translateY(-100vh) rotate(0deg)',
            opacity: '1',
          },
          '100%': {
            transform: 'translateY(100vh) rotate(720deg)',
            opacity: '0',
          },
        },
        glowPulse: {
          '0%, 100%': {
            boxShadow: '0 0 5px rgba(0, 102, 255, 0.5)',
          },
          '50%': {
            boxShadow: '0 0 20px rgba(0, 102, 255, 0.8), 0 0 30px rgba(0, 102, 255, 0.6)',
          },
        },
        bounceIn: {
          '0%': {
            transform: 'scale(0.3)',
            opacity: '0',
          },
          '50%': {
            transform: 'scale(1.1)',
          },
          '70%': {
            transform: 'scale(0.9)',
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        scaleRotate: {
          '0%': {
            transform: 'scale(0.5) rotate(-12deg)',
            opacity: '0',
          },
          '50%': {
            transform: 'scale(1.1) rotate(6deg)',
          },
          '100%': {
            transform: 'scale(1) rotate(0deg)',
            opacity: '1',
          },
        },
        chipFly: {
          '0%': {
            transform: 'translate(0, 0) scale(1)',
            opacity: '1',
          },
          '100%': {
            transform: 'translate(var(--fly-x, 100px), var(--fly-y, -100px)) scale(0.5)',
            opacity: '0',
          },
        },
        cardFlip: {
          '0%': {
            transform: 'rotateY(0deg)',
          },
          '50%': {
            transform: 'rotateY(90deg)',
          },
          '100%': {
            transform: 'rotateY(0deg)',
          },
        },
        timerUrgent: {
          '0%, 100%': {
            transform: 'scale(1)',
          },
          '50%': {
            transform: 'scale(1.1)',
          },
        },
        slideInLeft: {
          from: {
            transform: 'translateX(-100px)',
            opacity: '0',
          },
          to: {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        slideInRight: {
          from: {
            transform: 'translateX(100px)',
            opacity: '0',
          },
          to: {
            transform: 'translateX(0)',
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