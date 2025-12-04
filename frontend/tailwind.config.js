import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        heading: ["Poppins", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      colors: {
        brand: {
          primary: "#2563EB", // blue-600
          secondary: "#7C3AED", // purple-600
          accent: "#0EA5E9", // cyan-500
        },
        surface: "#FFFFFF",
        background: "#F8FAFC",
        text: "#0F172A", // slate-900
        muted: "#64748B", // slate-500
      },
      boxShadow: {
        soft: "0 10px 25px rgba(15, 23, 42, 0.06)",
        card: "0 12px 30px rgba(15, 23, 42, 0.08)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["fantasy"],
    darkTheme: "fantasy",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: false,
    themeRoot: "html",
  },
};
