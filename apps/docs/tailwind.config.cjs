const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}',
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  darkMode: 'class',
  safelist: [
    // Framework binding colors used in the data-driven packages section.
    // Tailwind cannot detect dynamically-constructed class names like
    // `bg-${color}-500`, so every variant must be listed explicitly.
    ...[
      'sky', // React
      'rose', // Angular
      'emerald', // Vue (upcoming)
    ].flatMap((c) => [
      `border-${c}-200`,
      `border-${c}-300`,
      `border-${c}-400`,
      `border-${c}-600`,
      `border-${c}-700`,
      `border-${c}-800`,
      `bg-${c}-50/60`,
      `bg-${c}-500`,
      `bg-${c}-500/10`,
      `text-${c}-500`,
      `text-${c}-600`,
      `text-${c}-700`,
      `text-${c}-300`,
      `text-${c}-400`,
      `dark:border-${c}-600`,
      `dark:border-${c}-700`,
      `dark:border-${c}-800`,
      `dark:bg-${c}-950/20`,
      `dark:bg-${c}-400/10`,
      `dark:text-${c}-300`,
      `dark:text-${c}-400`,
      `hover:border-${c}-400`,
      `dark:hover:border-${c}-600`,
      `bg-${c}-300`,
      `dark:bg-${c}-700`,
      `w-px`,
    ]),
  ],
  theme: {
    extend: {
      colors: {
        primary: {
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
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        surface: {
          light: '#ffffff',
          dark: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Source Code Pro', 'monospace'],
      },
      animation: {
        gradient: 'gradient 8s ease infinite',
        float: 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'route-progress': 'routeProgress 2.5s ease-out forwards',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        routeProgress: {
          '0%': { width: '15%', opacity: '1' },
          '50%': { width: '60%', opacity: '1' },
          '100%': { width: '90%', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
