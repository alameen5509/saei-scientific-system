// قائمة المهام
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckSquare } from "lucide-react";

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-saei-purple-700 mb-1">
          المهام
        </h1>
        <p className="text-stone-600 text-sm">
          متابعة المهام الموزّعة على الباحثين عبر المشاريع
        </p>
      </div>

      <Card>
        <CardHeader className="text-center py-12">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-saei-purple/10 grid place-items-center text-saei-purple-700 mb-4">
            <CheckSquare className="h-8 w-8" />
          </div>
          <CardTitle>صفحة المهام قيد البناء</CardTitle>
          <CardDescription>
            ستتاح هنا قائمة كاملة بالمهام مع فلترة بالحالة والأولوية والمسؤول.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
