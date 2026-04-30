import type { Config } from "tailwindcss";

// تكوين Tailwind لنظام إدارة الأعمال العلمية في مؤسسة ساعي
// — ألوان المؤسسة: purple/gold/teal
// — خطوط Cairo (واجهة) و Amiri (نصوص شرعية)
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
        // هوية ساعي
        saei: {
          purple: {
            DEFAULT: "#5E5495",
            50: "#F2F0F8",
            100: "#E5E1F0",
            200: "#CBC4E1",
            300: "#A89DCD",
            400: "#8275B5",
            500: "#5E5495",
            600: "#4A4178",
            700: "#3F3766",
            800: "#2E2849",
            900: "#1F1B30",
          },
          gold: {
            DEFAULT: "#C9A84C",
            50: "#FBF7EB",
            100: "#F6EFD3",
            200: "#EDDFA6",
            300: "#E0C875",
            400: "#D6B85F",
            500: "#C9A84C",
            600: "#A78838",
            700: "#7E662A",
            800: "#56451D",
            900: "#2E260F",
          },
          teal: {
            DEFAULT: "#2ABFBF",
            50: "#E6F8F8",
            100: "#C4F0F0",
            200: "#8AE0E0",
            300: "#52D0D0",
            400: "#2ABFBF",
            500: "#229999",
            600: "#1B7373",
            700: "#144D4D",
            800: "#0C2727",
            900: "#000000",
          },
          cream: "#FAF8F3",
          ink: "#1F1B30",
        },
      },
      fontFamily: {
        // Cairo للواجهة العامة
        sans: ["var(--font-cairo)", "Cairo", "system-ui", "sans-serif"],
        cairo: ["var(--font-cairo)", "Cairo", "sans-serif"],
        // Amiri للنصوص الشرعية والقرآنية
        amiri: ["var(--font-amiri)", "Amiri", "Traditional Arabic", "serif"],
      },
      boxShadow: {
        "saei-sm": "0 2px 8px -2px rgba(94, 84, 149, 0.12)",
        "saei-md": "0 8px 24px -8px rgba(94, 84, 149, 0.18)",
        "saei-lg": "0 16px 40px -12px rgba(94, 84, 149, 0.22)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
    },
  },
  plugins: [],
};

export default config;
