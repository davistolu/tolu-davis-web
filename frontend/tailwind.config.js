/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        canvas: {
          dark: '#0a0a0c',
          card: '#121215',
          subtle: '#18181d',
          border: 'rgba(255, 255, 255, 0.08)',
          light: '#fafaf9',
          lightCard: '#ffffff',
          lightBorder: 'rgba(0, 0, 0, 0.08)',
        }
      },
      screens: {
        'xs': '475px',
      },
      maxWidth: {
        '8xl': '88rem',
      }
    },
  },
  plugins: [],
};
