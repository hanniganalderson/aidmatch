/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Premium color palette
        primary: {
          DEFAULT: '#5865F2',
          50: '#F5F6FE',
          100: '#E5E7FD',
          200: '#C5C9FB',
          300: '#A5ABF9',
          400: '#858DF7',
          500: '#5865F2', // Main brand color
          600: '#4752C4',
          700: '#363E96',
          800: '#242968',
          900: '#12153A'
        },
        surface: {
          DEFAULT: '#1A1A1A',
          50: '#2A2A2A',
          100: '#222222',
          200: '#1A1A1A',
          300: '#171717',
          400: '#141414',
          500: '#111111',
          600: '#0E0E0E',
          700: '#0B0B0B',
          800: '#080808',
          900: '#050505'
        }
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 200ms ease-out',
        'slide-down': 'slideDown 200ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'enter': 'enter 200ms ease-out',
        'exit': 'exit 200ms ease-in',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        enter: {
          '0%': { transform: 'scale(0.95) translateY(10px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        exit: {
          '0%': { transform: 'scale(1) translateY(0)', opacity: '1' },
          '100%': { transform: 'scale(0.95) translateY(10px)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        }
      },
      boxShadow: {
        'glow-sm': '0 0 10px -1px rgba(88, 101, 242, 0.1)',
        'glow': '0 0 20px -2px rgba(88, 101, 242, 0.15)',
        'glow-lg': '0 0 30px -3px rgba(88, 101, 242, 0.2)',
        'premium': '0 8px 16px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(88, 101, 242, 0.1)',
        'premium-hover': '0 12px 24px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(88, 101, 242, 0.15)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-premium': 'linear-gradient(135deg, #5865F2 0%, #4752C4 100%)',
        'gradient-dark': 'linear-gradient(180deg, #1A1A1A 0%, #121212 100%)',
      }
    },
  },
  plugins: [],
};