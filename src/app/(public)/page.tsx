// صفحة الواجهة العامة لنظام إدارة الأعمال العلمية
import Link from "next/link";
import {
  FolderKanban,
  Users,
  FileBarChart,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: FolderKanban,
    title: "إدارة المشاريع البحثية",
    description:
      "تتبّع كل مشروع علمي من المقترح إلى الأرشفة، مع جدولة المهام وتعيين الباحثين.",
    color: "bg-saei-purple/10 text-saei-purple",
  },
  {
    icon: Users,
    title: "ملفات الباحثين",
    description:
      "سجلّات تعريفية ومنشورات ومشاركات لكل باحث في المؤسسة، مع لوحة إنتاجية.",
    color: "bg-saei-teal/10 text-saei-teal",
  },
  {
    icon: FileBarChart,
    title: "التقارير والإحصاءات",
    description:
      "لوحات بيانية تفاعلية لإنتاجية الباحثين والمشاريع، قابلة للتصدير والمشاركة.",
    color: "bg-saei-gold/15 text-saei-gold-700",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="container mx-auto px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-saei-purple text-white grid place-items-center font-extrabold shadow-saei-sm">
            س
          </div>
          <div>
            <div className="font-extrabold text-saei-purple-700 leading-tight">
              مؤسسة ساعي
            </div>
            <div className="text-xs text-stone-500">
              نظام إدارة الأعمال العلمية
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">دخول</Link>
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link href="/dashboard">لوحة التحكم</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-saei-purple via-saei-purple-700 to-saei-purple-800 text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 25%, #C9A84C 0, transparent 35%), radial-gradient(circle at 85% 75%, #2ABFBF 0, transparent 35%)",
          }}
        />

        <div className="container relative mx-auto px-4 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-saei-gold/40 bg-white/5 px-4 py-1.5 text-xs text-saei-gold mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            النسخة الأولى — قيد البناء
          </div>

          <h1 className="font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
            نظام إدارة الأعمال العلمية
            <br />
            <span className="text-saei-gold">مؤسسة ساعي</span>
          </h1>

          <p className="text-lg md:text-xl text-saei-cream/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            منصّة موحّدة لإدارة المشاريع البحثية، الباحثين، المهام والتقارير في
            مؤسسة ساعي العلمية.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button asChild variant="gold" size="lg">
              <Link href="/dashboard">
                ادخل إلى لوحة التحكم
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-saei-cream text-saei-cream hover:bg-saei-cream hover:text-saei-purple-800"
            >
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-extrabold text-saei-purple-700 mb-3">
            ما يقدّمه النظام
          </h2>
          <p className="text-stone-600 max-w-xl mx-auto">
            أدوات متخصصة لإدارة الإنتاج العلمي في المؤسسة من البداية إلى النهاية
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="hover:shadow-saei-md transition-shadow">
                <CardHeader>
                  <div
                    className={`h-14 w-14 rounded-2xl grid place-items-center mb-3 ${f.color}`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <CardTitle>{f.title}</CardTitle>
                  <CardDescription>{f.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      <footer className="mt-auto bg-saei-purple-800 text-saei-cream py-8">
        <div className="container mx-auto px-4 text-center text-sm">
          © {new Date().getFullYear()} مؤسسة ساعي — نظام إدارة الأعمال العلمية.
          كل الحقوق محفوظة.
        </div>
      </footer>
    </div>
  );
}
