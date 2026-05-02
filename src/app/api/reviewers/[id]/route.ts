// PUT    /api/reviewers/[id] — تعديل محكم (تخصصات / حالة نشاط / خبرة)
// DELETE /api/reviewers/[id] — حذف محكم (يحذف User أيضاً، يفشل إن كانت لديه مراجعات نشطة)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { serializeReviewer } from "@/lib/reviews-service";

export const runtime = "nodejs";

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

interface Params {
  params: { id: string };
}

export async function PUT(req: Request, { params }: Params) {
  const me = await requireRole(...COORD_ROLES);
  if (!me) {
    return NextResponse.json({ ok: false, error: "غير مصرّح" }, { status: 401 });
  }
  try {
    const exists = await prisma.reviewer.findUnique({
      where: { id: params.id },
    });
    if (!exists) {
      return NextResponse.json(
        { ok: false, error: "المحكم غير موجود" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { expertise, specialties, active, name } = body as {
      expertise?: string;
      specialties?: unknown;
      active?: boolean;
      name?: string;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {};
    if (typeof expertise === "string") data.expertise = expertise.trim() || null;
    if (typeof active === "boolean") data.active = active;

    if (specialties !== undefined) {
      if (!Array.isArray(specialties))
        return NextResponse.json(
          { ok: false, error: "التخصصات يجب أن تكون قائمة" },
          { status: 400 }
        );
      const clean = specialties.filter(
        (s): s is string =>
          typeof s === "string" && VALID_SPECIALTIES.includes(s)
      );
      if (clean.length === 0)
        return NextResponse.json(
          { ok: false, error: "اختر تخصصاً واحداً على الأقل" },
          { status: 400 }
        );
      data.specialties = clean;
    }

    if (Object.keys(data).length === 0 && typeof name !== "string") {
      return NextResponse.json(
        { ok: false, error: "لا توجد تغييرات" },
        { status: 400 }
      );
    }

    if (Object.keys(data).length > 0) {
      await prisma.reviewer.update({
        where: { id: params.id },
        data,
      });
    }

    // تعديل الاسم في User إن طُلب
    if (typeof name === "string" && name.trim().length >= 2) {
      await prisma.user.update({
        where: { id: exists.userId },
        data: { name: name.trim() },
      });
    }

    const updated = await prisma.reviewer.findUnique({
      where: { id: params.id },
      include: { user: { select: { name: true, email: true } } },
    });
    return NextResponse.json({
      ok: true,
      reviewer: serializeReviewer(updated!),
    });
  } catch (err) {
    console.error("PUT /api/reviewers/[id]", err);
    return NextResponse.json(
      { ok: false, error: "تعذّر تحديث المحكم" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const me = await requireRole(...COORD_ROLES);
  if (!me) {
    return NextResponse.json({ ok: false, error: "غير مصرّح" }, { status: 401 });
  }
  try {
    const reviewer = await prisma.reviewer.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            reviews: { where: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } } },
          },
        },
      },
    });
    if (!reviewer) {
      return NextResponse.json(
        { ok: false, error: "المحكم غير موجود" },
        { status: 404 }
      );
    }
    if (reviewer._count.reviews > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: `لا يمكن الحذف — لدى المحكم ${reviewer._count.reviews} مراجعات نشطة. أعِد إسنادها أو ضع المحكم في وضع غير نشط.`,
        },
        { status: 409 }
      );
    }

    // حذف User يحذف Reviewer تلقائياً (Cascade)
    await prisma.user.delete({ where: { id: reviewer.userId } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/reviewers/[id]", err);
    return NextResponse.json(
      { ok: false, error: "تعذّر حذف المحكم" },
      { status: 500 }
    );
  }
}
