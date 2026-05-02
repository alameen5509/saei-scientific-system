# نظام إدارة الأعمال العلمية — مؤسسة ساعي

منصة إدارية متكاملة لمؤسسة ساعي العلمية، تتيح إدارة المشاريع البحثية والباحثين والمحكمين والتقارير، مع نظام تحكيم معمَّى احترافي.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748)](https://prisma.io)
[![NextAuth](https://img.shields.io/badge/NextAuth-v4-blue)](https://next-auth.js.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-007ACC)](https://typescriptlang.org)

---

## أبرز المزايا

| الميزة | الوصف |
|--------|-------|
| 🔐 **مصادقة + RBAC** | NextAuth v4 + bcrypt + ٥ أدوار (مدير، منسق أبحاث، منسق مجلة، باحث، محكم) |
| 📚 **إدارة الأعمال العلمية** | CRUD كامل + ٧ مراحل سير العمل + جدول قابل للترتيب + فلاتر متقدمة + بحث |
| 👥 **إدارة المستخدمين والمحكمين** | بطاقات تخصصات + معدلات استجابة + حماية ضد الحذف الخطأ |
| 🎯 **تحكيم معمَّى** | إخفاء كامل لهوية الباحث + نظام نقاط لاقتراح المحكمين الأنسب |
| 📊 **نموذج تحكيم شامل** | ٣ تقييمات (علمي/لغوي/منهجي) + ٤ قرارات + ملاحظات للباحث + سرّية للمنسق |
| 🔔 **تذكيرات بـrate-limit** | ٢٤ساعة بين التذكيرات المتتالية لتفادي إزعاج المحكم |
| 🌐 **عربية + RTL كامل** | Cairo للواجهة، Amiri للنصوص الشرعية، أرقام عربية شرقية |
| ✨ **UX بمستوى SaaS** | AlertDialog + Toast + Skeleton + Empty States + validation حيّ |
| 📱 **Responsive كامل** | جدول للكمبيوتر + بطاقات للجوال على كل صفحة |

---

## الـStack التقني

| الطبقة | التقنية |
|--------|---------|
| الإطار | Next.js 14 (App Router) + React 18 |
| اللغة | TypeScript strict |
| التصميم | Tailwind CSS v3 + Radix UI primitives |
| الرسوم البيانية | Recharts |
| المصادقة | NextAuth v4 (Credentials + JWT) + bcryptjs |
| قاعدة البيانات | PostgreSQL + Prisma 7 + `@prisma/adapter-pg` |
| الأيقونات | lucide-react |

---

## بدء التشغيل المحلي

### المتطلبات
- Node.js 20+
- PostgreSQL — أو `npx prisma dev` لاستخدام DB محلية مدمجة

### الخطوات
```bash
# ١. تثبيت الحزم (يتضمن prisma generate تلقائياً عبر postinstall)
npm install

# ٢. تشغيل قاعدة بيانات محلية
npx prisma dev -d -n default
# ثم انسخ DATABASE_URL إلى .env

# ٣. إنشاء جداول قاعدة البيانات
npm run db:push

# ٤. ملء قاعدة البيانات بالبيانات التجريبية
npm run db:seed

# ٥. تشغيل خادم التطوير
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) وادخل بأحد الحسابات التجريبية (كلمة السرّ الموحَّدة: `Saei@2026`):

| البريد | الدور |
|--------|------|
| `admin@saei.local` | مدير النظام |
| `research.coord@saei.local` | منسق الأبحاث |
| `journal.coord@saei.local` | منسق المجلة |
| `abdullah.salem@saei.local` | باحث |
| `reviewer.hadith@saei.local` | محكم (حديث/تراجم) |
| `reviewer.usul@saei.local` | محكم (أصول/فقه) |
| `reviewer.tafsir@saei.local` | محكم (تفسير/عقيدة/عربية) |

---

## النشر إلى الإنتاج

اقرأ دليل النشر الكامل في **[DEPLOYMENT.md](./DEPLOYMENT.md)** — يغطّي:
- إنشاء حساب GitHub ورفع المستودع
- ربط المستودع بـVercel
- توفير قاعدة بيانات Postgres سحابية (Vercel Postgres / Neon / Supabase)
- ضبط متغيّرات البيئة الإنتاجية
- ربط Domain مخصَّص

---

## الأوامر

```bash
npm run dev          # خادم التطوير (port 3000)
npm run build        # بناء إنتاج
npm run start        # تشغيل بناء الإنتاج
npm run lint         # ESLint

# قاعدة البيانات
npm run db:generate  # توليد Prisma Client
npm run db:push      # دفع schema إلى DB (تطوير)
npm run db:migrate   # إنشاء migration (إنتاج)
npm run db:studio    # واجهة تصفُّح البيانات
npm run db:seed      # ملء البيانات التجريبية
npm run db:reset     # إعادة تعيين كاملة + seed
```

---

## نظام الصلاحيات (RBAC)

| الدور | الصلاحيات |
|------|-----------|
| **ADMIN** | كل شيء + إدارة المستخدمين |
| **RESEARCH_COORDINATOR** | إدارة الأعمال + الباحثين + المحكمين + التقارير |
| **JOURNAL_COORDINATOR** | نفس صلاحيات منسق الأبحاث |
| **RESEARCHER** | dashboard + الملف الشخصي فقط |
| **REVIEWER** | dashboard + المراجعات + الملف الشخصي |

الحماية تطبَّق على ٣ مستويات: middleware (تحويل غير المخوَّلين)، API routes (`requireRole`)، وUI (تصفية Sidebar).

---

## خصوصية التحكيم المعمَّى

نظام التحكيم يضمن إخفاء هوية الباحث على ٤ مستويات:
1. **API:** `serializeReviewForReviewer()` لا يعيد أبداً حقل `researcher` أو `code`
2. **Authorization:** `reviewBelongsToUser()` يتحقق أن المراجعة تخصّ المحكم الحالي
3. **UI:** صفحة `/reviews/[id]` تعرض شريطاً واضحاً يوضح حجب الهوية
4. **DB:** مراجعات SUBMITTED مغلقة ضد التعديل لنزاهة السجل

---

## الترخيص والملكية

© 2026 مؤسسة ساعي العلمية. جميع الحقوق محفوظة.
