/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    function({ addUtilities }) {
      addUtilities({
        '.mask-fade-x': {
          'mask-image': 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          '-webkit-mask-image': 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        },
      })
    },
  ],
}
