/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bchl-navy': '#1b263d',
        'bchl-light-orange': '#ff6e1a',
      },
    },
  },
  plugins: [],
}

