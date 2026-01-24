/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f5f3ff', // keeping for backward compatibility if needed, but primary is the new main
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#673DE6',
          600: '#5b35cd',
          700: '#4c2bb3',
          background: '#FFFFFF',
          card: '#FAFAFF',
          divider: '#EDEBFA',
        },
        // New Design System Colors
        neutral: {
          0: '#fff',
          50: '#f8f9fa',
          100: '#eeeef0',
          200: '#dedee2',
          300: '#c6c6cc',
          400: '#9d9ea4',
          500: '#797980',
          600: '#58585e',
          700: '#36363b',
          800: '#222225',
          900: '#18181a',
          950: '#101011',
          1000: '#000',
        },
        primary: {
          50: '#f5f6ff',
          100: '#e6e8ff',
          200: '#d9dbff',
          300: '#bcbdff',
          400: '#9d99ff',
          500: '#7b66ff',
          600: '#673de6',
          700: '#471ea7',
          800: '#331c74',
          900: '#251951',
          950: '#110c29',
        },
        meteorite: {
          50: '#f5f5ff',
          100: '#eaeaff',
          200: '#cbc8ff',
          300: '#b6b2ff',
          400: '#a19bff',
          500: '#8c85ff',
        },
        'light-blue': {
          50: '#fafbff',
          100: '#f4f5ff',
          200: '#d5dfff',
          300: '#c3cce9',
          400: '#b0b9d4',
          500: '#888faa',
        },
        neon: {
          500: '#cf0',
          600: '#bded00',
        },
        peridot: {
          500: '#0f0',
          600: '#20e052',
        },
        warning: {
          50: '#fdf6e8',
          100: '#ffeec8',
          200: '#ffe399',
          300: '#ffd366',
          400: '#ffbf1a',
          500: '#e69800',
          600: '#c46c00',
          700: '#9b4600',
          800: '#6b2c00',
          900: '#4a1c00',
        },
        success: {
          600: '#673de6', // Placeholder if needed, but user didn't provide full success palette in snippet? - actually they did in CSS vars: --h-color-success-600.
          // Let's assume standard tailwind colors or what was provided.
          // Wait, user provided --h-color-success-600 etc in CSS vars section?
          // "Show all properties (40 more)" - I don't have them all.
          // I will use what's explicit.
        },
        danger: {
          600: '#d32f2f', // Inferred standard
        },
        secondary: '#2F80ED',
        slate: {
          950: '#0F172A',
          600: '#475569',
          400: '#94A3B8',
        }
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'lg-alt': '20px',
        'xl': '24px',
        '2xl': '32px',
        'full': '999px',
      },
      spacing: {
        '4xs': '2px',
        '3xs': '4px',
        '2xs': '8px',
        'xs': '12px',
        'sm': '16px',
        'md-alt': '20px',
        'md': '24px',
        'lg': '32px',
        'xl': '40px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '80px',
      },
      zIndex: {
        '1': '100',
        '2': '200',
        '3': '300',
        '4': '400',
        'hp-action': '400',
        '5': '500',
        '6': '600',
        'modal': '600',
        'hp-action-modal': '700',
        '10': '1000',
        'intercom-1': '1100',
        'intercom-2': '1200',
        'intercom-3': '1300',
        'max': '2147483647',
        'child-1': '10',
        'child-2': '20',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    }
  },
  plugins: [],
}
