/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 8s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        'spin-slow-reverse': 'spin 15s linear infinite reverse',
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'gradient-y': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center center'
          }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right bottom'
          }
        }
      },
      colors: {
        surface: {
          light: {
            50: '#FAFAFA',
            100: '#F4F4F5',
            200: '#E4E4E7',
          },
          dark: {
            50: '#27272A',
            100: '#18181B',
            200: '#121214',
            300: '#09090B',
            400: '#030303',
          }
        },
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        secondary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        accent: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          600: '#16A34A',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
        },
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
        },
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      boxShadow: {
        'glow-sm': '0 0 10px -1px rgba(139, 92, 246, 0.2)',
        'glow': '0 0 20px -2px rgba(139, 92, 246, 0.25)',
        'glow-lg': '0 0 30px -3px rgba(139, 92, 246, 0.3)',
        'premium': '0 8px 24px rgba(139, 92, 246, 0.25)',
        'premium-hover': '0 12px 32px rgba(139, 92, 246, 0.35)',
        'accent': '0 8px 24px rgba(16, 185, 129, 0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
        'gradient-accent': 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        'gradient-primary-accent': 'linear-gradient(135deg, #6d28d9 0%, #059669 100%)',
        'gradient-dark': 'linear-gradient(180deg, #1e1b4b 0%, #0f0f11 100%)',
        'gradient-green': 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
        'gradient-premium': 'linear-gradient(135deg, #059669 0%, #3B82F6 100%)',
        'gradient-green-blue': 'linear-gradient(135deg, #059669 0%, #3B82F6 100%)',
        'gradient-green-light': 'linear-gradient(135deg, #34D399 0%, #6EE7B7 100%)',
        'pattern-light': 'url("/patterns/light-pattern.svg")',
        'pattern-dark': 'url("/patterns/dark-pattern.svg")',
        'gradient-light': 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
      }
    },
  },
  plugins: [],
};