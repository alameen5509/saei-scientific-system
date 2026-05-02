// GET /api/reviews — قائمة المراجعات للمستخدم الحالي
// — REVIEWER: مراجعاته فقط، معمَّاة (بدون كشف الباحث)
// — COORDINATORs/ADMIN: كل المراجعات (مع بيانات الباحث)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import {
  serializeReviewForCoordinator,
  serializeReviewForReviewer,
} from "@/lib/reviews-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COORD_ROLES = ["ADMIN", "RESEARCH_COORDINATOR", "JOURNAL_COORDINATOR"];

export async function GET() {
  const me = await requireAuth();
  if (!me) {
    return NextResponse.json(
      { ok: false, error: "غير مصرّح" },
      { status: 401 }
    );
  }

  try {
    if (me.role === "REVIEWER") {
      // فقط مراجعات هذا المحكم
      const reviewer = await prisma.reviewer.findUnique({
        where: { userId: me.id },
        select: { id: true },
      });
      if (!reviewer) {
        return NextResponse.json({ ok: true, reviews: [] });
      }
      const rows = await prisma.review.findMany({
        where: { reviewerId: reviewer.id },
        orderBy: [{ status: "asc" }, { dueDate: "asc" }],
        include: {
          work: {
            select: {
              id: true,
              title: true,
              specialty: true,
              track: true,
              notes: true,
            },
          },
        },
      });
      return NextResponse.json({
        ok: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        reviews: rows.map((r) => serializeReviewForReviewer(r as any)),
      });
    }

    if (COORD_ROLES.includes(me.role)) {
      const rows = await prisma.review.findMany({
        orderBy: { assignedAt: "desc" },
        include: {
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
        },
      });
      return NextResponse.json({
        ok: true,
        reviews: rows.map(serializeReviewForCoordinator),
      });
    }

    return NextResponse.json(
      { ok: false, error: "غير مصرّح بالوصول" },
      { status: 403 }
    );
  } catch (err) {
    console.error("GET /api/reviews", err);
    return NextResponse.json(
      { ok: false, error: "تعذّر تحميل المراجعات" },
      { status: 500 }
    );
  }
}
