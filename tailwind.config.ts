import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        nomi: {
          bg: "#020817",
          surface: "#0f172a",
          accent: "#38bdf8",
          warn: "#f97316"
        }
      }
    }
  },
  plugins: [],
};
export default config;
