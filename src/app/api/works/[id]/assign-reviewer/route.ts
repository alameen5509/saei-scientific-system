// POST /api/works/[id]/assign-reviewer
// — يعيّن محكماً لعمل علمي (المنسقون والمدير)
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { assignReviewer } from "@/lib/reviews-service";

export const runtime = "nodejs";

interface Params {
  params: { id: string };
}

export async function POST(req: Request, { params }: Params) {
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
    const body = await req.json();
    const { reviewerId, dueDate } = body as {
      reviewerId?: string;
      dueDate?: string;
    };
    if (!reviewerId || typeof reviewerId !== "string") {
      return NextResponse.json(
        { ok: false, error: "اختر محكماً" },
        { status: 400 }
      );
    }
    const due = dueDate ? new Date(dueDate) : undefined;
    if (due && Number.isNaN(due.getTime())) {
      return NextResponse.json(
        { ok: false, error: "تاريخ غير صالح" },
        { status: 400 }
      );
    }

    const result = await assignReviewer(params.id, reviewerId, due);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { ok: true, reviewId: result.reviewId },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/works/[id]/assign-reviewer", err);
    return NextResponse.json(
      { ok: false, error: "تعذّر التعيين" },
      { status: 500 }
    );
  }
}
