import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  safelist: [
    // Base
    "bg-primary-500", "bg-primary-600",
    // Matérias
    "bg-blue-600",    // Matemática
    "bg-orange-600",  // Português
    "bg-rose-600",    // Literatura
    "bg-sky-600",     // Inglês
    "bg-red-600",     // Espanhol
    "bg-pink-600",    // Artes / Redação
    "bg-emerald-600", // Educação Física / Biologia
    "bg-cyan-600",    // Tecnologias
    "bg-fuchsia-600", // Redação
    "bg-amber-600",   // História
    "bg-green-600",   // Geografia
    "bg-violet-600",  // Filosofia
    "bg-purple-600",  // Sociologia
    "bg-teal-600",    // Biologia
    "bg-lime-600",    // Química
    "bg-indigo-600",  // Física
    // Legados (manter compatibilidade)
    "bg-amber-700", "bg-green-700", "bg-violet-700", "bg-purple-700",
    "bg-rose-700",  "bg-blue-800",  "bg-red-700",    "bg-pink-700",
    "bg-emerald-700", "bg-cyan-700", "bg-teal-600",  "bg-zinc-800",
  ]
};
export default config;
