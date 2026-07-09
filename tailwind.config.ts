import type { Config } from "tailwindcss";

const config: Config = {
  // Ensure dark mode triggers correctly based on a class applied to the <html> tag
  darkMode: 'class', 
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#6D28D9",   // Deep Purple
          lavender: "#A78BFA", // Lavender
          gold: "#FBBF24",     // Gold
          white: "#FAFAFA",    // Soft White
          dark: "#0F172A",     // Slate-900
        }
      }
    },
  },
  plugins: [],
};
export default config;