/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        ziqx: {
          bg: '#f8f7f4',
          thread: '#e7e4dc',
          card: '#ffffff',
          border: '#efede8',
          'border-subtle': '#f0eeea',
          dark: '#1a1a18',
          muted: '#8f8f8e',
          secondary: '#5b5b5a',
          dim: '#b1b0ae',
          green: {
            DEFAULT: '#0b5c46',
            hover: '#084836',
            light: '#ddf3e5',
            lighter: '#eaf8ef',
            dark: '#063b2d',
          },
          badge: {
            blue: '#e4eefb',
            'blue-text': '#1e60b5',
            purple: '#efeafb',
            'purple-text': '#6b38c2',
            yellow: '#fcefd6',
            'yellow-text': '#b46b02',
            pink: '#fbe5ec',
            'pink-text': '#ba2755',
            green: '#dcfce7',
            'green-text': '#15803d',
            red: '#fee2e2',
            'red-text': '#b91c1c',
            orange: '#fef3c7',
            'orange-text': '#b45309',
          }
        }
      },
      boxShadow: {
        'panel': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'modal': '0 20px 40px -8px rgba(0, 0, 0, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.06)',
        'drawer': '-8px 0 24px -4px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
