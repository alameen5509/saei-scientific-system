// POST /api/works/[id]/advance — نقل عمل إلى المرحلة التالية في WorkflowStage
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { findNextStageCode, serializeWork } from "@/lib/works-service";

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
    return NextResponse.json(
      { ok: false, error: "غير مصرّح" },
      { status: 401 }
    );
  }
  try {
    const work = await prisma.scientificWork.findUnique({
      where: { id: params.id },
    });
    if (!work) {
      return NextResponse.json(
        { ok: false, error: "العمل غير موجود" },
        { status: 404 }
      );
    }

    const nextCode = await findNextStageCode(work.stageCode);
    if (!nextCode) {
      return NextResponse.json(
        { ok: false, error: "لا توجد مرحلة لاحقة" },
        { status: 400 }
      );
    }

    const updated = await prisma.scientificWork.update({
      where: { id: params.id },
      data: {
        stageCode: nextCode,
        progress: nextCode === "PUBLISHED" ? 100 : work.progress,
      },
      include: { researcher: { select: { displayName: true } } },
    });

    return NextResponse.json({ ok: true, work: serializeWork(updated) });
  } catch (err) {
    console.error("POST /api/works/[id]/advance", err);
    return NextResponse.json(
      { ok: false, error: "تعذّر نقل المرحلة" },
      { status: 500 }
    );
  }
}
