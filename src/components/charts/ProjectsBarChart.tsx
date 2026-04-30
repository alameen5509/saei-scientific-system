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
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E1F0" />
          <XAxis
            dataKey="label"
            stroke="#6B6088"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#6B6088"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(94, 84, 149, 0.08)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #E5E1F0",
              fontFamily: "var(--font-cairo), Cairo, sans-serif",
            }}
            labelStyle={{ color: "#3F3766", fontWeight: 700 }}
          />
          <Bar dataKey="value" fill="#5E5495" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
