import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#121417",
        moss: "#28524A",
        coral: "#E85D4F",
        cloud: "#F6F7F4",
        gold: "#C89B3C"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(18, 20, 23, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
