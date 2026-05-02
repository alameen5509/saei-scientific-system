// POST /api/reviews/[id]/remind — تسجيل تذكير للمحكم (للمنسقين)
// — لا يرسل بريداً (نرفع lastRemindedAt في DB فقط حالياً)
// — حد: لا يُكرَّر خلال 24 ساعة
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";

export const runtime = "nodejs";

interface Params {
  params: { id: string };
}

export async function POST(_: Request, { params }: Params) {
  const me = await requireRole(
    "ADMIN",
    "RESEARCH_COORDINATOR",
    "JOURNAL_COORDINATOR"
  );
  if (!me) {
    return NextResponse.json({ ok: false, error: "غير مصرّح" }, { status: 401 });
  }

  try {
    const review = await prisma.review.findUnique({
      where: { id: params.id },
    });
    if (!review) {
      return NextResponse.json(
        { ok: false, error: "المراجعة غير موجودة" },
        { status: 404 }
      );
    }
    if (review.status === "SUBMITTED" || review.status === "DECLINED") {
      return NextResponse.json(
        { ok: false, error: "لا حاجة للتذكير في هذه المرحلة" },
        { status: 400 }
      );
    }

    // حد التذكير: مرة كل ٢٤ ساعة
    if (review.lastRemindedAt) {
      const since = Date.now() - review.lastRemindedAt.getTime();
      const hours = since / (1000 * 60 * 60);
      if (hours < 24) {
        return NextResponse.json(
          {
            ok: false,
            error: `تمّ التذكير قبل ${Math.floor(hours)} ساعة. حاول لاحقاً.`,
          },
          { status: 429 }
        );
      }
    }

    const updated = await prisma.review.update({
      where: { id: params.id },
      data: { lastRemindedAt: new Date() },
    });

    // ملاحظة: في الإنتاج، أضف هنا إرسال بريد عبر Resend/Nodemailer.
    return NextResponse.json({
      ok: true,
      lastRemindedAt: updated.lastRemindedAt?.toISOString() ?? null,
    });
  } catch (err) {
    console.error("POST /api/reviews/[id]/remind", err);
    return NextResponse.json(
      { ok: false, error: "تعذّر تسجيل التذكير" },
      { status: 500 }
    );
  }
}
