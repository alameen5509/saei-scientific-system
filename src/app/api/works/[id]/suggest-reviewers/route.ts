// GET /api/works/[id]/suggest-reviewers
// — يُرجع قائمة محكمين مرشَّحين لعمل علمي، مرتبة بدرجة الملاءمة
// — للمنسقين والمدير فقط
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { suggestReviewers } from "@/lib/reviews-service";

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
    const suggestions = await suggestReviewers(params.id);
    return NextResponse.json({ ok: true, suggestions });
  } catch (err) {
    console.error("GET /api/works/[id]/suggest-reviewers", err);
    return NextResponse.json(
      { ok: false, error: "تعذّر اقتراح المحكمين" },
      { status: 500 }
    );
  }
}
