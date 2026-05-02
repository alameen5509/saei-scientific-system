import type { Config } from "tailwindcss";

// تكوين Tailwind لنظام إدارة الأعمال العلمية — مؤسسة ساعي
// ============================================================
// الهوية البصرية الجديدة (مطابقة لموقع ساعي الرسمي)
//   - اللون الأساسي: تركوازي #00D4DD (saei-purple — الاسم محفوظ للتوافق)
//   - اللون الثانوي: أزرق سماوي #0EA5E9 (saei-gold — الاسم محفوظ للتوافق)
//   - aliases جديدة بأسماء صحيحة: saei-cyan, saei-sky
// ============================================================
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
        // ============================================================
        // saei.purple = اللون الأساسي (تركوازي #00D4DD)
        // الاسم محفوظ من الإصدار السابق لتفادي تعديل ٢٠٠+ فئة CSS
        // ============================================================
        saei: {
          purple: {
            DEFAULT: "#00D4DD",
            50: "#ECFEFF",
            100: "#CFFAFE",
            200: "#A5F3FC",
            300: "#67E8F0",
            400: "#22D3DD",
            500: "#00D4DD",
            600: "#0891A6",
            700: "#0E7490",
            800: "#155E75",
            900: "#164E63",
          },
          // saei.gold = اللون الثانوي (أزرق سماوي #0EA5E9)
          gold: {
            DEFAULT: "#0EA5E9",
            50: "#F0F9FF",
            100: "#E0F2FE",
            200: "#BAE6FD",
            300: "#7DD3FC",
            400: "#38BDF8",
            500: "#0EA5E9",
            600: "#0284C7",
            700: "#0369A1",
            800: "#075985",
            900: "#0C4A6E",
          },
          // saei.teal — لون مكمّل (أخضر-تركوازي)
          teal: {
            DEFAULT: "#06B6D4",
            50: "#ECFEFF",
            100: "#CFFAFE",
            200: "#A5F3FC",
            300: "#67E8F0",
            400: "#22D3DD",
            500: "#06B6D4",
            600: "#0891B2",
            700: "#0E7490",
            800: "#155E75",
            900: "#164E63",
          },
          // ============================================================
          // aliases بأسماء صحيحة — مفضَّلة في الكود الجديد
          // ============================================================
          cyan: {
            DEFAULT: "#00D4DD",
            50: "#ECFEFF",
            100: "#CFFAFE",
            200: "#A5F3FC",
            300: "#67E8F0",
            400: "#22D3DD",
            500: "#00D4DD",
            600: "#0891A6",
            700: "#0E7490",
            800: "#155E75",
            900: "#164E63",
          },
          sky: {
            DEFAULT: "#0EA5E9",
            50: "#F0F9FF",
            100: "#E0F2FE",
            200: "#BAE6FD",
            300: "#7DD3FC",
            400: "#38BDF8",
            500: "#0EA5E9",
            600: "#0284C7",
            700: "#0369A1",
            800: "#075985",
            900: "#0C4A6E",
          },
          // الخلفية + النص الأساسي
          cream: "#F8FAFC", // slate-50 — خلفية حيادية باردة تكمل التركوازي
          ink: "#0F172A", // slate-900 — نص قاتم وحيادي
        },
      },
      fontFamily: {
        sans: ["var(--font-cairo)", "Cairo", "system-ui", "sans-serif"],
        cairo: ["var(--font-cairo)", "Cairo", "sans-serif"],
        amiri: ["var(--font-amiri)", "Amiri", "Traditional Arabic", "serif"],
      },
      boxShadow: {
        // ظلال تركوازية تكمّل الـpalette
        "saei-sm": "0 2px 8px -2px rgba(0, 212, 221, 0.18)",
        "saei-md": "0 8px 24px -8px rgba(14, 165, 233, 0.22)",
        "saei-lg": "0 16px 40px -12px rgba(14, 165, 233, 0.28)",
      },
      backgroundImage: {
        "saei-gradient": "linear-gradient(135deg, #00D4DD 0%, #0EA5E9 100%)",
        "saei-gradient-soft":
          "linear-gradient(135deg, #67E8F0 0%, #38BDF8 100%)",
        "saei-gradient-dark":
          "linear-gradient(135deg, #0E7490 0%, #075985 100%)",
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
