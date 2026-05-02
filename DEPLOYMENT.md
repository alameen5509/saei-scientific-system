# دليل النشر إلى الإنتاج

دليل خطوة-بخطوة لنشر **نظام إدارة الأعمال العلمية** على الإنترنت.

> ⚠️ **ملاحظة عن الحسابات:** إنشاء حسابات GitHub و Vercel يتطلب تأكيد بشري (التحقق من البريد، 2FA، قبول الشروط). هذه خطوات يدوية بحتة لا يمكن أتمتتها — يجب على مالك المشروع تنفيذها بنفسه.

---

## نظرة عامة على الأجزاء

| الجزء | الخدمة | الكلفة |
|------|-------|--------|
| 1️⃣ مستودع الكود | GitHub | مجاني |
| 2️⃣ النشر التلقائي | Vercel | مجاني (Hobby) كافٍ للبدء |
| 3️⃣ قاعدة البيانات | Vercel Postgres / Neon / Supabase | مجاني للتجربة، مدفوع للإنتاج الجاد |
| 4️⃣ الدومين | اختياري | حسب المسجِّل |

---

## ١. إنشاء حساب GitHub والمستودع

### أ. إنشاء الحساب
1. اذهب إلى [github.com/signup](https://github.com/signup)
2. اسم الحساب المقترح: **`saei-foundation`** (إن كان متاحاً) أو `saei-org`
3. أكمل التحقق من البريد + فعِّل **2FA** (إلزامي للمؤسسات)

### ب. إنشاء organization (موصى به)
- مفيد لاحقاً عند إضافة فريق العمل
- اذهب إلى Settings → Organizations → New
- اختر الخطة Free

### ج. إنشاء المستودع
1. من الواجهة: New repository
2. الاسم: **`saei-scientific-system`**
3. اجعله **Private** (يحوي بيانات حساسة)
4. **لا تنشئ** README/`.gitignore`/license (موجودون مسبقاً)

### د. ربط المستودع المحلي ودفع الكود
في PowerShell من جذر المشروع:
```bash
# إن لم يكن git مهيأ مع remote — أضف origin
git remote add origin https://github.com/saei-foundation/saei-scientific-system.git

# دفع الفرع master
git branch -M main
git push -u origin main
```

> 💡 إن طُلب منك مصادقة، استخدم **Personal Access Token** (Settings → Developer settings → Tokens) بدل كلمة المرور.

---

## ٢. توفير قاعدة بيانات PostgreSQL

اختر **واحدة** من الخيارات التالية. كلها تعطيك `DATABASE_URL` ينتهي بـ`?sslmode=require`:

### الخيار أ: Vercel Postgres (الأسهل، متكامل)
- داخل لوحة Vercel للمشروع → Storage → Create Database → Postgres
- يُضاف `POSTGRES_PRISMA_URL` و `POSTGRES_URL_NON_POOLING` تلقائياً إلى متغيّرات البيئة
- استخدم `POSTGRES_PRISMA_URL` كـ`DATABASE_URL`

### الخيار ب: Neon (موصى به للمشاريع المتوسطة)
1. سجِّل في [neon.tech](https://neon.tech)
2. New Project → اختر منطقة قريبة (`eu-central-1` Frankfurt)
3. انسخ `DATABASE_URL` من Connection Details
4. تأكَّد أن السلسلة تنتهي بـ`?sslmode=require`

### الخيار ج: Supabase
- [supabase.com](https://supabase.com) → New project
- Settings → Database → Connection string (Transaction Pooler)
- استبدل `[YOUR-PASSWORD]` بكلمة سرّ DB

---

## ٣. النشر على Vercel

### أ. إنشاء حساب Vercel وربطه بـGitHub
1. اذهب إلى [vercel.com/signup](https://vercel.com/signup)
2. اختر **Continue with GitHub** (نفس حساب `saei-foundation`)
3. وافق على صلاحيات Vercel للوصول إلى المستودع

### ب. استيراد المشروع
1. من Dashboard: Add New… → Project
2. اختر مستودع **`saei-scientific-system`**
3. **Framework Preset:** Next.js (يُكتشف تلقائياً)
4. **Build Command:** اتركه فارغاً — `vercel.json` يحدّده (`prisma generate && next build`)
5. **Root Directory:** `.`

### ج. ضبط Environment Variables
في صفحة الاستيراد، أضف هذه المتغيّرات (تأكَّد من إضافتها لـ**كل البيئات**: Production + Preview + Development):

| المتغيّر | القيمة |
|---------|------|
| `DATABASE_URL` | URL DB من الجزء ٢ |
| `NEXTAUTH_SECRET` | شغّل `openssl rand -base64 32` وانسخ الناتج |
| `NEXTAUTH_URL` | `https://saei-scientific-system.vercel.app` (يُحدَّث لاحقاً عند ربط دومين) |

> ⚠️ لا تستخدم نفس `NEXTAUTH_SECRET` المحلي — ولِّد قيمة جديدة للإنتاج.

### د. النشر الأول
- اضغط **Deploy**
- البناء سيستغرق ٢-٣ دقائق
- ستحصل على URL: `https://saei-scientific-system-xxx.vercel.app`

### هـ. تطبيق Schema على قاعدة البيانات الإنتاجية
عند أول نشر، الـDB فارغ. شغّل من جهازك المحلي مع `DATABASE_URL` الإنتاجي:

```bash
# مؤقتاً، صدّر متغيّر بيئة
export DATABASE_URL="postgresql://...الإنتاج..."

# ادفع schema (للإطلاق الأول)
npm run db:push

# ائت بالبيانات الأولية (المراحل + حساب المدير)
npm run db:seed
```

> 💡 للإطلاقات اللاحقة، استخدم `prisma migrate deploy` بدل `db:push`.

---

## ٤. ربط Domain مخصَّص (اختياري)

### أ. شراء الدومين
أمثلة على المسجِّلين: Cloudflare, Namecheap, GoDaddy.
أمثلة على الأسماء: `saei.org.sa`, `saei-system.com`.

### ب. الربط في Vercel
1. لوحة المشروع → Settings → Domains
2. أضف الدومين
3. اتبع التعليمات لإضافة سجلات DNS:
   - **A record** على `@` يشير إلى IP Vercel
   - **CNAME** على `www` يشير إلى `cname.vercel-dns.com`
4. SSL يُولَّد تلقائياً (Let's Encrypt)

### ج. تحديث `NEXTAUTH_URL`
بعد ربط الدومين:
1. Vercel → Settings → Environment Variables
2. غيِّر `NEXTAUTH_URL` إلى `https://your-domain.com`
3. أعد النشر (Deployments → آخر نشر → Redeploy)

---

## ٥. تأمين الإنتاج

### أ. تغيير كلمات السرّ التجريبية
- بعد أول دخول كـADMIN، اذهب إلى `/profile` وغيِّر الكلمة
- **احذف** الحسابات التجريبية التي لن تُستخدم (`reviewer.hadith@`, etc.)
- أنشئ حسابات حقيقية للفريق

### ب. إعدادات GitHub
- Settings → Branch protection rules → إضافة قاعدة على `main`:
  - require pull request before merging
  - require status checks to pass
- Settings → Secrets → لا تضع أي شيء حسّاس في الكود

### ج. مراقبة Vercel
- Analytics: متابعة عدد الزيارات
- Logs: مراقبة أخطاء runtime
- Notifications: تفعيل تنبيهات الفشل

---

## ٦. الصيانة الدورية

### تحديثات الحزم
```bash
npm outdated      # عرض الإصدارات القديمة
npm update        # تحديث minor/patch
npm install <pkg>@latest  # تحديث major يدوياً
```

### النسخ الاحتياطي للقاعدة
- Vercel Postgres: backups تلقائية يومية
- Neon/Supabase: راجع لوحة الخدمة لتفعيل النسخ الاحتياطي

### نقل قاعدة البيانات
عند الترقية لإنتاج جاد:
```bash
pg_dump $OLD_DATABASE_URL > backup.sql
psql $NEW_DATABASE_URL < backup.sql
```

---

## أسئلة شائعة

### كيف أعرف أن النشر نجح؟
- افتح URL Vercel
- يجب أن تظهر الصفحة الرئيسية بـRTL وخطوط Cairo
- اذهب إلى `/login` وادخل بـadmin
- إن ظهر خطأ "تعذّر تحميل البيانات" — تحقق من `DATABASE_URL` و `db:push`

### الـbuild يفشل بـ"Cannot find module @/generated/prisma"
- تأكَّد أن `vercel.json` يحوي `"buildCommand": "prisma generate && next build"`
- `next.config.mjs` يحوي `outputFileTracingIncludes`

### NextAuth يعطي "Untrusted Host"
- `NEXTAUTH_URL` لا يطابق الـURL الفعلي
- أضف `NEXTAUTH_URL` بقيمة `https://your-domain.com` (بدون `/` في النهاية)
- أعد النشر

### كيف أُعيد إنشاء البيانات التجريبية على الإنتاج؟
```bash
DATABASE_URL="..." npm run db:reset
```
> ⚠️ هذا يحذف **كل** البيانات الإنتاجية. لا تستخدمه إلا في بيئات الاختبار.

---

## ملاحظة أخيرة عن الحسابات

إن لم تكن قد أنشأت بعد:
- **GitHub:** [github.com/signup](https://github.com/signup) → اسم المؤسسة `saei-foundation`
- **Vercel:** [vercel.com/signup](https://vercel.com/signup) → استخدم نفس حساب GitHub

كل ما تبقّى من الإعداد يمكن تنفيذه عبر CLI:
```bash
# Vercel CLI (موجود مسبقاً)
vercel login           # تسجيل الدخول
vercel link            # ربط المستودع المحلي بمشروع Vercel
vercel env add         # إضافة متغيّرات البيئة
vercel --prod          # نشر إلى الإنتاج
```

> 🌐 بعد إكمال الخطوات 1-3 من هذا الدليل، النظام جاهز للعمل على الإنترنت.
