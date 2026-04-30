// قائمة الباحثين
import { Plus, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const sample = [
  { id: 1, name: "أ.د. عبدالله السالم", role: "باحث رئيسي", email: "abdullah@saei.local", projects: 3 },
  { id: 2, name: "د. خالد الفهد", role: "باحث", email: "khaled@saei.local", projects: 2 },
  { id: 3, name: "د. سعيد الحربي", role: "باحث", email: "saeed@saei.local", projects: 1 },
  { id: 4, name: "أ. منال القحطاني", role: "مساعد بحث", email: "manal@saei.local", projects: 4 },
];

export default function ResearchersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-saei-purple-700 mb-1">
            الباحثون
          </h1>
          <p className="text-stone-600 text-sm">
            ملفات الباحثين العاملين في المؤسسة
          </p>
        </div>
        <Button variant="primary">
          <Plus className="h-4 w-4" />
          إضافة باحث
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sample.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <div className="h-14 w-14 rounded-full bg-saei-purple-100 grid place-items-center text-saei-purple-700 font-extrabold text-xl mb-2">
                {r.name.charAt(0)}
              </div>
              <CardTitle className="text-base">{r.name}</CardTitle>
              <CardDescription>{r.role}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-stone-600 ltr text-left">
                <Mail className="h-3.5 w-3.5" />
                <span dir="ltr">{r.email}</span>
              </div>
              <div className="text-xs text-saei-purple font-bold">
                {r.projects} مشاريع نشطة
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
