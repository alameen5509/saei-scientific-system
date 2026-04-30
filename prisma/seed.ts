// سكربت بذرة قاعدة البيانات — يُملأ بـSAMPLE_WORKS من src/lib/works-data.ts
// تشغيل: npm run db:seed (يُعرَّف في package.json: prisma.seed = "tsx prisma/seed.ts")
//
// السكربت idempotent: يحذف البيانات الموجودة ثم يعيد الإدخال.

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { SAMPLE_WORKS } from "../src/lib/works-data";
import { STAGE_LABEL, STAGE_ORDER } from "../src/types/works";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});
const prisma = new PrismaClient({ adapter });

// إزالة لقب العنوان للحصول على اسم أساسي مشترك
const TITLE_REGEX = /^(أ\.د\.|د\.|أ\.)\s*/;
const stripTitle = (s: string) => s.replace(TITLE_REGEX, "").trim();
const extractTitle = (s: string) => s.match(TITLE_REGEX)?.[1] ?? null;

// أسماء لاتينية بسيطة لتوليد بريد قابل للقراءة
const SLUG_BY_NAME: Record<string, string> = {
  "عبدالله السالم": "abdullah.salem",
  "خالد الفهد": "khaled.fahd",
  "سعيد الحربي": "saeed.harbi",
  "منال القحطاني": "manal.qahtani",
  "محمد العتيبي": "mohammed.otaibi",
};

async function main() {
  console.log("🧹 تنظيف البيانات الحالية...");
  await prisma.review.deleteMany();
  await prisma.scientificWork.deleteMany();
  await prisma.workflowStage.deleteMany();
  await prisma.researcher.deleteMany();
  await prisma.reviewer.deleteMany();
  await prisma.user.deleteMany();

  // ————— مراحل سير العمل —————
  console.log("📋 إدخال مراحل سير العمل...");
  for (let i = 0; i < STAGE_ORDER.length; i++) {
    const code = STAGE_ORDER[i];
    await prisma.workflowStage.create({
      data: {
        code,
        label: STAGE_LABEL[code],
        order: i + 1,
      },
    });
  }

  // ————— مدير النظام —————
  console.log("👤 إنشاء حساب المدير...");
  await prisma.user.create({
    data: {
      email: "admin@saei.local",
      name: "مدير النظام",
      role: "ADMIN",
    },
  });

  // ————— الباحثون (تجميع فريد بالاسم بعد تجريد اللقب) —————
  console.log("🎓 إنشاء الباحثين...");
  const fullNameByBase = new Map<string, string>();
  for (const w of SAMPLE_WORKS) {
    const base = stripTitle(w.researcher);
    // نأخذ أول لقب نراه (الأعلى عادة)
    if (!fullNameByBase.has(base)) {
      fullNameByBase.set(base, w.researcher);
    } else {
      const existing = fullNameByBase.get(base)!;
      const existingTitle = extractTitle(existing);
      const newTitle = extractTitle(w.researcher);
      // نفضّل أ.د. على د. على أ.
      const rank = (t: string | null) =>
        t === "أ.د." ? 3 : t === "د." ? 2 : t === "أ." ? 1 : 0;
      if (rank(newTitle) > rank(existingTitle)) {
        fullNameByBase.set(base, w.researcher);
      }
    }
  }

  const researcherIdByBase = new Map<string, string>();
  let i = 1;
  for (const [base, displayName] of Array.from(fullNameByBase.entries())) {
    const slug = SLUG_BY_NAME[base] ?? `researcher${i}`;
    const user = await prisma.user.create({
      data: {
        email: `${slug}@saei.local`,
        name: displayName,
        role: "RESEARCHER",
      },
    });
    const r = await prisma.researcher.create({
      data: {
        userId: user.id,
        displayName,
        academicTitle: extractTitle(displayName),
        specialty: null,
      },
    });
    researcherIdByBase.set(base, r.id);
    i++;
  }

  // ————— مراجع علمي تجريبي —————
  console.log("🧐 إنشاء هيئة المراجعة...");
  const reviewerUser = await prisma.user.create({
    data: {
      email: "reviewer@saei.local",
      name: "هيئة المراجعة العلمية",
      role: "REVIEWER",
    },
  });
  await prisma.reviewer.create({
    data: {
      userId: reviewerUser.id,
      expertise: "المراجعة الشرعية والتحقيق",
    },
  });

  // ————— الأعمال العلمية —————
  console.log("📚 إدخال الأعمال العلمية...");
  for (const w of SAMPLE_WORKS) {
    const base = stripTitle(w.researcher);
    const researcherId = researcherIdByBase.get(base);
    if (!researcherId) {
      console.warn(`⚠️  لم يُعثر على باحث للعمل ${w.code}: ${w.researcher}`);
      continue;
    }
    await prisma.scientificWork.create({
      data: {
        code: w.code,
        title: w.title,
        specialty: w.specialty,
        track: w.track,
        researcherId,
        stageCode: w.stage,
        progress: w.progress,
        startedAt: new Date(w.startedAt),
        deadline: new Date(w.deadline),
        notes: w.notes ?? null,
      },
    });
  }

  console.log(
    `\n✅ اكتمل: ${STAGE_ORDER.length} مراحل، ${
      researcherIdByBase.size
    } باحثين، ${SAMPLE_WORKS.length} عملاً علمياً.`
  );
}

main()
  .catch((e) => {
    console.error("❌ فشلت عملية البذر:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
