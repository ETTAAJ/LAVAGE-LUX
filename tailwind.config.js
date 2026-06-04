/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./public/booking.js"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#121212",
        surface: "#1b1b1b",
        panel: "#0f0f0f",
        texte: "#e8e5e3",
        mute: "#9b9b9b",
        or: "#fde400"
      },
      fontFamily: {
        title: ["Space Grotesk", "ui-sans-serif", "system-ui"],
        body: ["Manrope", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        luxe: "0 12px 35px -15px rgba(253, 228, 0, 0.25)"
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};
