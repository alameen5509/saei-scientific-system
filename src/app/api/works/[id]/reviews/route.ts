// GET /api/works/[id]/reviews — كل مراجعات عمل (للمنسقين)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { serializeReviewForCoordinator } from "@/lib/reviews-service";

export const runtime = "nodejs";

interface Params {
  params: { id: string };
}

export async function GET(_: Request, { params }: Params) {
  const me = await requireRole(
    "ADMIN",
    "RESEARCH_COORDINATOR",
    "JOURNAL_COORDINATOR"
  );
  if (!me) {
    return NextResponse.json(
      { ok: false, error: "غير مصرّح" },
      { status: 401 }
    );
  }
  try {
    const rows = await prisma.review.findMany({
      where: { workId: params.id },
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
  } catch (err) {
    console.error("GET /api/works/[id]/reviews", err);
    return NextResponse.json(
      { ok: false, error: "تعذّر تحميل المراجعات" },
      { status: 500 }
    );
  }
}
