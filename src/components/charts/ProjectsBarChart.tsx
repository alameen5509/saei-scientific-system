"use client";

// رسم بياني عمودي لتوزيع المشاريع حسب الحالة (Recharts)
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface ChartDatum {
  label: string;
  value: number;
}

export function ProjectsBarChart({ data }: { data: ChartDatum[] }) {
  return (
    <div className="h-72 w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 12, right: 12, left: 12, bottom: 12 }}
        >
          {/* hex hardcoded — recharts لا يقرأ Tailwind classes */}
          <CartesianGrid strokeDasharray="3 3" stroke="#CFFAFE" />
          <XAxis
            dataKey="label"
            stroke="#0E7490"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#0E7490"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(0, 212, 221, 0.08)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #CFFAFE",
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
            }}
            labelStyle={{ color: "#0F172A", fontWeight: 700 }}
          />
          {/* تركوازي ساعي #00D4DD */}
          <Bar dataKey="value" fill="#00D4DD" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
