// لوحة التحكم الرئيسية — KPIs + رسم بياني + تنبيه الصلاحيات
import { Suspense } from "react";
import {
  FolderKanban,
  Users,
  CheckSquare,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProjectsBarChart } from "@/components/charts/ProjectsBarChart";
import { DeniedBanner } from "@/components/layout/DeniedBanner";
import { toArabicDigits } from "@/lib/utils";

const kpis = [
  {
    label: "المشاريع النشطة",
    value: 24,
    icon: FolderKanban,
    color: "text-saei-purple",
    bg: "bg-saei-purple/10",
  },
  {
    label: "الباحثون",
    value: 47,
    icon: Users,
    color: "text-saei-teal",
    bg: "bg-saei-teal/10",
  },
  {
    label: "المهام المفتوحة",
    value: 132,
    icon: CheckSquare,
    color: "text-saei-gold-700",
    bg: "bg-saei-gold/15",
  },
  {
    label: "نسبة الإنجاز",
    value: "٧٢٪",
    icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    raw: true,
  },
];

const chartData = [
  { label: "مقترح", value: 6 },
  { label: "معتمد", value: 4 },
  { label: "قيد التنفيذ", value: 14 },
  { label: "متوقف", value: 2 },
  { label: "مكتمل", value: 18 },
  { label: "مؤرشف", value: 9 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <DeniedBanner />
      </Suspense>

      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-saei-purple-700 mb-1">
          لوحة التحكم
        </h1>
        <p className="text-stone-600 text-sm">
          نظرة عامة على نشاط المؤسسة العلمي
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label}>
              <CardHeader className="flex-row items-center gap-3 pb-2">
                <div className={`h-11 w-11 rounded-xl grid place-items-center ${k.bg} ${k.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <CardDescription>{k.label}</CardDescription>
                  <CardTitle className="text-2xl tabular-nums">
                    {k.raw ? k.value : toArabicDigits(k.value as number)}
                  </CardTitle>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>توزيع المشاريع حسب الحالة</CardTitle>
          <CardDescription>
            عدد المشاريع البحثية في كل مرحلة من دورة حياتها
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectsBarChart data={chartData} />
        </CardContent>
      </Card>
    </div>
  );
}
