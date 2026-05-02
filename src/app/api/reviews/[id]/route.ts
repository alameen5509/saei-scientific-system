// GET    /api/reviews/[id] — مراجعة محددة
//   - REVIEWER: تظهر معمَّاة، فقط إن كان مالكاً للمراجعة
//   - COORDINATORs/ADMIN: كاملة
// PUT    /api/reviews/[id] — حفظ مسودّة (REVIEWER فقط، لمراجعاته)
// DELETE /api/reviews/[id] — حذف مراجعة (COORDINATORs/ADMIN، فقط إن لم تُسلَّم)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/api-auth";
import {
  reviewBelongsToUser,
  serializeReviewForCoordinator,
  serializeReviewForReviewer,
} from "@/lib/reviews-service";

export const runtime = "nodejs";

const COORD_ROLES = ["ADMIN", "RESEARCH_COORDINATOR", "JOURNAL_COORDINATOR"];

interface Params {
  params: { id: string };
}

const fullInclude = {
  reviewer: {
    select: {
      id: true,
      user: { select: { name: true, email: true } },
    },
  },
  work: {
    select: {
      id: true,
      code: true,
      title: true,
      specialty: true,
      track: true,
      notes: true,
      researcher: { select: { displayName: true } },
    },
  },
} as const;

export async function GET(_: Request, { params }: Params) {
  const me = await requireAuth();
  if (!me) {
    return NextResponse.json({ ok: false, error: "غير مصرّح" }, { status: 401 });
  }

  try {
    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: fullInclude,
    });
    if (!review) {
      return NextResponse.json(
        { ok: false, error: "المراجعة غير موجودة" },
        { status: 404 }
      );
    }

    if (me.role === "REVIEWER") {
      const isOwner = await reviewBelongsToUser(params.id, me.id);
      if (!isOwner) {
        return NextResponse.json(
          { ok: false, error: "غير مصرّح بالوصول" },
          { status: 403 }
        );
      }
      // معمَّاة (بدون researcher / code)
      return NextResponse.json({
        ok: true,
        review: serializeReviewForReviewer(review),
      });
    }

    if (COORD_ROLES.includes(me.role)) {
      return NextResponse.json({
        ok: true,
        review: serializeReviewForCoordinator(review),
      });
    }

    return NextResponse.json(
      { ok: false, error: "غير مصرّح" },
      { status: 403 }
    );
  } catch (err) {
    console.error("GET /api/reviews/[id]", err);
    return NextResponse.json(
      { ok: false, error: "خطأ في الخادم" },
      { status: 500 }
    );
  }
}

// PUT: حفظ مسودّة — لا تُغيّر الحالة إلى SUBMITTED
export async function PUT(req: Request, { params }: Params) {
  const me = await requireAuth();
  if (!me) {
    return NextResponse.json({ ok: false, error: "غير مصرّح" }, { status: 401 });
  }
  if (me.role !== "REVIEWER") {
    return NextResponse.json(
      { ok: false, error: "حفظ المسوّدات للمحكم فقط" },
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
    if (review.status === "SUBMITTED") {
      return NextResponse.json(
        { ok: false, error: "المراجعة سُلِّمت ولا يمكن تعديلها" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      scientificScore,
      linguisticScore,
      methodologyScore,
      decision,
      recommendations,
      notesToEditor,
    } = body as {
      scientificScore?: number | null;
      linguisticScore?: number | null;
      methodologyScore?: number | null;
      decision?: string | null;
      recommendations?: string;
      notesToEditor?: string;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {};
    const checkScore = (v: unknown): number | null => {
      if (v === null || v === undefined || v === "") return null;
      if (typeof v === "number" && v >= 1 && v <= 10) return Math.floor(v);
      return null;
    };
    if ("scientificScore" in body)
      data.scientificScore = checkScore(scientificScore);
    if ("linguisticScore" in body)
      data.linguisticScore = checkScore(linguisticScore);
    if ("methodologyScore" in body)
      data.methodologyScore = checkScore(methodologyScore);
    if ("decision" in body)
      data.decision =
        decision &&
        ["ACCEPT", "MINOR_REVISION", "MAJOR_REVISION", "REJECT"].includes(
          decision
        )
          ? decision
          : null;
    if (typeof recommendations === "string")
      data.recommendations = recommendations.trim() || null;
    if (typeof notesToEditor === "string")
      data.notesToEditor = notesToEditor.trim() || null;

    // أول لمسة على الحقول → IN_PROGRESS
    if (review.status === "ASSIGNED") {
      data.status = "IN_PROGRESS";
    }

    const updated = await prisma.review.update({
      where: { id: params.id },
      data,
      include: fullInclude,
    });

    return NextResponse.json({
      ok: true,
      review: serializeReviewForReviewer(updated),
    });
  } catch (err) {
    console.error("PUT /api/reviews/[id]", err);
    return NextResponse.json(
      { ok: false, error: "تعذّر حفظ المراجعة" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, { params }: Params) {
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
    if (review.status === "SUBMITTED") {
      return NextResponse.json(
        {
          ok: false,
          error: "لا يمكن حذف مراجعة تمّ تسليمها",
        },
        { status: 400 }
      );
    }
    await prisma.review.delete({ where: { id: params.id } });
    // إنقاص العدّاد
    await prisma.reviewer.update({
      where: { id: review.reviewerId },
      data: { totalAssigned: { decrement: 1 } },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/reviews/[id]", err);
    return NextResponse.json(
      { ok: false, error: "تعذّر الحذف" },
      { status: 500 }
    );
  }
}
