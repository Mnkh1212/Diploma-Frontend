/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0D0D0D",
          card: "#1A1A2E",
          surface: "#16213E",
          border: "#2A2A3E",
        },
        primary: "#00C853",
        accent: {
          green: "#00C853",
          orange: "#FF6B35",
          red: "#FF4444",
          purple: "#7C4DFF",
          blue: "#448AFF",
          yellow: "#FFD600",
        },
      },
    },
  },
  plugins: [],
};
