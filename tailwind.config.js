/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        eyone: {
          blue: '#0066CC',
          orange: '#FF6600',
          gray: {
            dark: '#333333',
            light: '#F5F5F5'
          }
        }
      },
      animation: {
        typing: 'typing 3s steps(40, end) infinite',
        'bounce-delay': 'bounce 1s infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0, 0, 0.2, 1) infinite',
        float: 'float 10s ease-in-out infinite',
      },
      blur: {
        '4xl': '100px',
      }
    },
  },
  plugins: [],
};