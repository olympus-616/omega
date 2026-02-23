/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        olympus: {
          bg: "#06060A",
          surface: "#0D0D12",
          border: "#1A1A24",
          gold: "#C8A84E",
          text: "#E8E4DC",
          muted: "#8A8A8A",
        },
      },
    },
  },
  plugins: [],
};
