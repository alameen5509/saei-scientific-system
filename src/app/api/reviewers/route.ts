// GET  /api/reviewers — قائمة المحكمين (COORDINATORs + ADMIN)
// POST /api/reviewers — إنشاء محكم جديد (يُنشئ User + Reviewer معاً)
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { serializeReviewer } from "@/lib/reviews-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COORD_ROLES = [
  "ADMIN",
  "RESEARCH_COORDINATOR",
  "JOURNAL_COORDINATOR",
] as const;

const VALID_SPECIALTIES = [
  "HADITH",
  "USUL",
  "TAFSIR",
  "AQEEDAH",
  "FIQH",
  "SEERAH",
  "ARABIC",
  "BIO",
];

export async function GET() {
  const me = await requireRole(...COORD_ROLES);
  if (!me) {
    return NextResponse.json({ ok: false, error: "غير مصرّح" }, { status: 401 });
  }
  try {
    const rows = await prisma.reviewer.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    });
    return NextResponse.json({
      ok: true,
      reviewers: rows.map(serializeReviewer),
    });
  } catch (err) {
    console.error("GET /api/reviewers", err);
    return NextResponse.json(
      { ok: false, error: "تعذّر تحميل المحكمين" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const me = await requireRole(...COORD_ROLES);
  if (!me) {
    return NextResponse.json({ ok: false, error: "غير مصرّح" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { email, name, password, expertise, specialties } = body as {
      email?: string;
      name?: string;
      password?: string;
      expertise?: string;
      specialties?: unknown;
    };

    if (!email || typeof email !== "string" || !email.includes("@"))
      return NextResponse.json(
        { ok: false, error: "البريد الإلكتروني غير صالح" },
        { status: 400 }
      );
    if (!name || typeof name !== "string" || name.trim().length < 2)
      return NextResponse.json(
        { ok: false, error: "الاسم قصير جداً" },
        { status: 400 }
      );
    if (!password || typeof password !== "string" || password.length < 8)
      return NextResponse.json(
        { ok: false, error: "كلمة المرور يجب ألا تقل عن ٨ أحرف" },
        { status: 400 }
      );
    if (!Array.isArray(specialties) || specialties.length === 0)
      return NextResponse.json(
        { ok: false, error: "اختر تخصصاً واحداً على الأقل" },
        { status: 400 }
      );
    const cleanSpecs = specialties.filter(
      (s): s is string => typeof s === "string" && VALID_SPECIALTIES.includes(s)
    );
    if (cleanSpecs.length === 0)
      return NextResponse.json(
        { ok: false, error: "تخصصات غير صحيحة" },
        { status: 400 }
      );

    const normalizedEmail = email.toLowerCase().trim();
    const exists = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (exists)
      return NextResponse.json(
        { ok: false, error: "البريد مسجَّل مسبقاً" },
        { status: 409 }
      );

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        password: hashed,
        role: "REVIEWER",
      },
    });
    const reviewer = await prisma.reviewer.create({
      data: {
        userId: user.id,
        expertise: expertise?.trim() || null,
        specialties: cleanSpecs,
        active: true,
      },
      include: { user: { select: { name: true, email: true } } },
    });

    return NextResponse.json(
      { ok: true, reviewer: serializeReviewer(reviewer) },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/reviewers", err);
    return NextResponse.json(
      { ok: false, error: "تعذّر إنشاء المحكم" },
      { status: 500 }
    );
  }
}
