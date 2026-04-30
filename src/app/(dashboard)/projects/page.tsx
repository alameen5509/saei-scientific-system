// قائمة المشاريع البحثية
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const sample = [
  { id: 1, title: "مشروع تحقيق المخطوطات الحديثية", status: "قيد التنفيذ", lead: "أ.د. عبدالله السالم" },
  { id: 2, title: "دراسة فقه النوازل المعاصرة", status: "معتمد", lead: "د. خالد الفهد" },
  { id: 3, title: "موسوعة المصطلحات الأصولية", status: "مقترح", lead: "د. سعيد الحربي" },
];

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-saei-purple-700 mb-1">
            المشاريع البحثية
          </h1>
          <p className="text-stone-600 text-sm">
            إدارة وتتبع جميع المشاريع البحثية في المؤسسة
          </p>
        </div>
        <Button variant="primary">
          <Plus className="h-4 w-4" />
          مشروع جديد
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sample.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <span className="text-xs font-bold text-saei-purple px-2 py-1 rounded-full bg-saei-purple/10 w-fit">
                {p.status}
              </span>
              <CardTitle className="text-lg">{p.title}</CardTitle>
              <CardDescription>المسؤول: {p.lead}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-2 w-full rounded-full bg-saei-purple-50 overflow-hidden">
                <div className="h-full w-2/5 bg-saei-gold" />
              </div>
              <p className="text-xs text-stone-500 mt-2">٤٠٪ مكتمل</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
