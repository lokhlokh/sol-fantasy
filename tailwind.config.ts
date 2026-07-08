import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        field: "#0f7a55",
        clay: "#c95b3d",
        sol: "#2563eb",
        gold: "#f4b63f"
      },
      boxShadow: {
        soft: "0 12px 40px rgba(23, 32, 51, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
