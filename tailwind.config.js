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
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
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
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
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
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        accent: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
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
        }
      },
      boxShadow: {
        'glow-sm': '0 0 10px -1px rgba(16, 185, 129, 0.1)',
        'glow': '0 0 20px -2px rgba(16, 185, 129, 0.15)',
        'glow-lg': '0 0 30px -3px rgba(16, 185, 129, 0.2)',
        'premium': '0 8px 24px rgba(16, 185, 129, 0.15)',
        'premium-hover': '0 12px 32px rgba(16, 185, 129, 0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-green': 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
        'gradient-premium': 'linear-gradient(135deg, #059669 0%, #3B82F6 100%)',
        'gradient-dark': 'linear-gradient(180deg, #18181B 0%, #121214 100%)',
        'gradient-green-blue': 'linear-gradient(135deg, #059669 0%, #3B82F6 100%)',
        'gradient-green-light': 'linear-gradient(135deg, #34D399 0%, #6EE7B7 100%)',
        'pattern-light': 'url("/patterns/light-pattern.svg")',
        'pattern-dark': 'url("/patterns/dark-pattern.svg")',
      }
    },
  },
  plugins: [],
};