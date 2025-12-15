/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'hand': ['"Patrick Hand"', 'cursive'],
        'sans': ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      keyframes: {
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'spring-up': {
          '0%': { transform: 'scale(0.8) translateY(20px)', opacity: '0' },
          '60%': { transform: 'scale(1.02) translateY(-5px)', opacity: '1' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pop': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        'glitch-anim': {
          '0%': { clipPath: 'inset(20% 0 80% 0)', transform: 'translate(-2px, 1px)' },
          '20%': { clipPath: 'inset(60% 0 10% 0)', transform: 'translate(2px, -1px)' },
          '40%': { clipPath: 'inset(40% 0 50% 0)', transform: 'translate(-2px, 2px)' },
          '60%': { clipPath: 'inset(80% 0 5% 0)', transform: 'translate(2px, -2px)' },
          '80%': { clipPath: 'inset(10% 0 60% 0)', transform: 'translate(-1px, 1px)' },
          '100%': { clipPath: 'inset(0 0 0 0)', transform: 'translate(0)' },
        },
        'mesh': {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'neon-pulse': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 5px currentColor' },
          '50%': { opacity: '0.5', boxShadow: '0 0 15px currentColor' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'wiggle': {
           '0%, 100%': { transform: 'rotate(-1deg)' },
           '50%': { transform: 'rotate(1deg)' }
        }
      },
      animation: {
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'fade-in-down': 'fade-in-down 0.3s ease-out forwards',
        'spring-up': 'spring-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shake': 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both',
        'float': 'float 6s ease-in-out infinite',
        'pop': 'pop 0.3s ease-in-out',
        'glitch': 'glitch-anim 0.3s infinite linear alternate-reverse',
        'mesh': 'mesh 10s ease-in-out infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'scanline': 'scanline 2s linear infinite',
        'wiggle': 'wiggle 0.3s ease-in-out infinite',
      }
    }
  },
  plugins: [],
}