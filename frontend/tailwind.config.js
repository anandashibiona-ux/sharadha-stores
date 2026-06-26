/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FAF9F6',
        surface: '#FFFFFF',
        charcoal: '#2B2B2B',
        muted: '#6B6B6B',
        accent: {
          DEFAULT: '#f97316',
          light: '#ffedd5',
          dark: '#ea580c',
        },
        border: '#E8E4DF',
        success: {
          DEFAULT: '#4A7C6F',
          light: '#EAF2F0',
        },
        warning: {
          DEFAULT: '#C89B3C',
          light: '#FDF5E3',
        },
        error: {
          DEFAULT: '#C14A4A',
          light: '#FAE8E8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(43,43,43,0.06)',
        'card-hover': '0 6px 20px rgba(43,43,43,0.1)',
        modal: '0 20px 60px rgba(43,43,43,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { from: { opacity: '0', transform: 'translateX(100%)' }, to: { opacity: '1', transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
}
