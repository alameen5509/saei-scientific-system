import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// دمج classNames مع تجنّب التعارض في Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// أرقام عربية شرقية للواجهة
const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
export function toArabicDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => arabicDigits[Number(d)]);
}

// تنسيق رقم بفاصل آلاف عربي
export function formatNumber(n: number, useArabic = true): string {
  const formatted = new Intl.NumberFormat(useArabic ? "ar-SA" : "en-US").format(
    n
  );
  return formatted;
}

// تنسيق تاريخ بالعربية
export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
