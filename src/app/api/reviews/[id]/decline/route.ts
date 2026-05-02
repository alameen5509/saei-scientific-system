// POST /api/reviews/[id]/decline — اعتذار المحكم
// — يقبل reason اختياري
// — لا يُحسب في totalCompleted
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { reviewBelongsToUser } from "@/lib/reviews-service";

export const runtime = "nodejs";

interface Params {
  params: { id: string };
}

export async function POST(req: Request, { params }: Params) {
  const me = await requireAuth();
  if (!me) {
    return NextResponse.json({ ok: false, error: "غير مصرّح" }, { status: 401 });
  }
  if (me.role !== "REVIEWER") {
    return NextResponse.json(
      { ok: false, error: "للمحكم فقط" },
      { status: 403 }
    );
  }
  const isOwner = await reviewBelongsToUser(params.id, me.id);
  if (!isOwner) {
    return NextResponse.json(
      { ok: false, error: "غير مصرّح بالوصول" },
      { status: 403 }
    );
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
    if (review.status !== "ASSIGNED") {
      return NextResponse.json(
        { ok: false, error: "لا يمكن الاعتذار في هذه المرحلة" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const reason =
      typeof body?.reason === "string" && body.reason.trim()
        ? body.reason.trim()
        : null;

    await prisma.review.update({
      where: { id: params.id },
      data: {
        status: "DECLINED",
        declinedAt: new Date(),
        declineReason: reason,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/reviews/[id]/decline", err);
    return NextResponse.json(
      { ok: false, error: "تعذّر تنفيذ الطلب" },
      { status: 500 }
    );
  }
}
