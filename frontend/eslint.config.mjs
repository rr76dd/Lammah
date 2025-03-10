import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "rgb(229 231 235)", // إصلاح مشكلة border-border
        background: {
          light: '#ffffff',
          dark: '#1a1a1a'
        },
        text: {
          light: '#000000',
          dark: '#e0e0e0'
        },
        card: {
          light: '#ffffff',
          dark: '#2d2d2d',
          border: {
            light: '#e5e7eb',
            dark: '#404040'
          }
        },
        button: {
          primary: {
            light: '#000000',
            dark: '#ffffff'
          },
          secondary: {
            light: '#4b5563',
            dark: '#9ca3af'
          }
        },
        hover: {
          light: '#f3f4f6',
          dark: '#404040'
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      }
    }
  },
  plugins: [tailwindcssAnimate]
};

export default tailwindConfig;
