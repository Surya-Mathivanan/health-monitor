import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          300: '#F5D97A',
          400: '#E8C547',
          500: '#D4AF37',
          600: '#B8960C',
          700: '#9A7B0A',
        },
        silver: {
          300: '#E8E8E8',
          400: '#C0C0C0',
          500: '#A8A8A8',
          600: '#888888',
        },
        brand: {
          emerald: '#10B981',
          sky: '#0EA5E9',
          blue: '#3B82F6',
          indigo: '#6366F1',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #10B981 0%, #0EA5E9 50%, #3B82F6 100%)',
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #F5D97A 50%, #B8960C 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(16,185,129,0.1) 0%, rgba(14,165,233,0.05) 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'brand': '0 4px 24px rgba(16,185,129,0.25)',
        'brand-lg': '0 8px 40px rgba(16,185,129,0.35)',
        'gold': '0 4px 24px rgba(212,175,55,0.30)',
        'blue': '0 4px 24px rgba(59,130,246,0.25)',
        'glass': '0 8px 32px rgba(0,0,0,0.12)',
        'card': '0 2px 16px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.16)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
