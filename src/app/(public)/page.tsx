// صفحة الواجهة العامة لنظام إدارة الأعمال العلمية
// — هوية بصرية: تركوازي #00D4DD → أزرق سماوي #0EA5E9
import Link from "next/link";
import {
  FolderKanban,
  Users,
  FileBarChart,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
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
    iconBg: "bg-saei-cyan/10",
    iconText: "text-saei-cyan-700",
  },
  {
    icon: Users,
    title: "ملفات الباحثين",
    description:
      "سجلّات تعريفية ومنشورات ومشاركات لكل باحث في المؤسسة، مع لوحة إنتاجية.",
    iconBg: "bg-saei-sky/10",
    iconText: "text-saei-sky-600",
  },
  {
    icon: FileBarChart,
    title: "التقارير والإحصاءات",
    description:
      "لوحات بيانية تفاعلية لإنتاجية الباحثين والمشاريع، قابلة للتصدير والمشاركة.",
    iconBg: "bg-saei-teal/10",
    iconText: "text-saei-teal-700",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="container mx-auto px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-saei-hero text-white grid place-items-center font-extrabold shadow-saei-sm">
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

      {/* ============================================================
          Hero — تدرج تركوازي/سماوي مع زخارف بيضاء
          ============================================================ */}
      <section className="relative overflow-hidden text-white bg-saei-hero-radial">
        {/* نمط شبكي خفيف للتزيين */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {/* فقاعة ضوء يمين */}
        <div
          aria-hidden
          className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
        />
        {/* فقاعة ضوء يسار */}
        <div
          aria-hidden
          className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
        />

        <div className="container relative mx-auto px-4 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs text-white mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            مؤسسة ساعي العلمية
          </div>

          <h1 className="font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-6 text-white">
            نظام إدارة الأعمال العلمية
            <br />
            <span className="text-white/90">منصّة موحّدة وآمنة</span>
          </h1>

          <p className="text-lg md:text-xl text-white/85 mb-10 max-w-2xl mx-auto leading-relaxed">
            إدارة المشاريع البحثية والباحثين والمحكمين والتقارير في مكان واحد —
            مع نظام تحكيم معمَّى احترافي.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {/* زر أبيض على الخلفية الملونة — أعلى تباين */}
            <Button
              asChild
              size="lg"
              className="bg-white text-saei-sky-700 hover:bg-white/90 shadow-saei-md"
            >
              <Link href="/dashboard">
                ادخل إلى لوحة التحكم
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-saei-sky-700"
            >
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
          </div>
        </div>

        {/* موجة سفلية للانتقال السلس */}
        <div className="relative h-12 sm:h-16">
          <svg
            className="absolute bottom-0 w-full h-full"
            preserveAspectRatio="none"
            viewBox="0 0 1440 80"
          >
            <path
              fill="#F8FAFC"
              d="M0,32L60,37.3C120,43,240,53,360,53.3C480,53,600,43,720,42.7C840,43,960,53,1080,53.3C1200,53,1320,43,1380,37.3L1440,32L1440,80L1380,80C1320,80,1200,80,1080,80C960,80,840,80,720,80C600,80,480,80,360,80C240,80,120,80,60,80L0,80Z"
            />
          </svg>
        </div>
      </section>

      {/* ============================================================
          Features
          ============================================================ */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-extrabold text-saei-ink mb-3">
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
              <Card
                key={f.title}
                className="hover:shadow-saei-md transition-shadow"
              >
                <CardHeader>
                  <div
                    className={`h-14 w-14 rounded-2xl grid place-items-center mb-3 ${f.iconBg} ${f.iconText}`}
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

      {/* ============================================================
          CTA bar — تركوازي مع زخرفة
          ============================================================ */}
      <section className="container mx-auto px-4 pb-16">
        <div className="rounded-3xl bg-saei-hero p-8 md:p-12 text-white text-center shadow-saei-lg relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl"
          />
          <ShieldCheck className="h-10 w-10 mx-auto mb-4 opacity-90" />
          <h3 className="text-2xl md:text-3xl font-extrabold mb-3">
            تحكيم معمَّى يحفظ خصوصية الباحث
          </h3>
          <p className="text-white/85 mb-6 max-w-xl mx-auto">
            نظام صارم لإخفاء هوية الباحث عن المحكمين، مع أدوات تعيين تلقائية
            وتقييم منظَّم.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-saei-sky-700 hover:bg-white/90"
          >
            <Link href="/login">جرّب النظام الآن</Link>
          </Button>
        </div>
      </section>

      <footer className="mt-auto bg-saei-sky-900 text-white/90 py-8">
        <div className="container mx-auto px-4 text-center text-sm">
          © {new Date().getFullYear()} مؤسسة ساعي — نظام إدارة الأعمال العلمية.
          كل الحقوق محفوظة.
        </div>
      </footer>
    </div>
  );
}
