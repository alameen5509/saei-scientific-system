// التقارير
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileBarChart } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-saei-purple-700 mb-1">
          التقارير
        </h1>
        <p className="text-stone-600 text-sm">
          تقارير دورية عن إنتاجية المشاريع والباحثين
        </p>
      </div>

      <Card>
        <CardHeader className="text-center py-12">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-saei-gold/15 grid place-items-center text-saei-gold-700 mb-4">
            <FileBarChart className="h-8 w-8" />
          </div>
          <CardTitle>التقارير قيد البناء</CardTitle>
          <CardDescription>
            ستتاح هنا تقارير شهرية وربع سنوية وسنوية قابلة للتصدير PDF و Excel.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
