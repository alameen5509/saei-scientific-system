// طبقة منطق التحكيم المعمى:
// — مطابقة المحكمين بالتخصص (suggestReviewers)
// — تسلسل بيانات المراجعة بصيغة تحفظ خصوصية الباحث (Blind serializer)
// — تحقّق الصلاحيات على المراجعة (المحكم لمراجعاته فقط، المنسق لكل المراجعات)

import { prisma } from "@/lib/prisma";
import type {
  BlindWorkDto,
  CoordinatorReviewDto,
  ReviewDecision,
  ReviewStatus,
  ReviewSubmitInput,
  ReviewerDto,
  ReviewerReviewDto,
} from "@/types/reviews";

const VALID_DECISIONS: ReviewDecision[] = [
  "ACCEPT",
  "MINOR_REVISION",
  "MAJOR_REVISION",
  "REJECT",
];

// ————————————————————————————————
// مطابقة المحكمين
// ————————————————————————————————

export interface ReviewerSuggestion {
  reviewerId: string;
  name: string;
  expertise: string | null;
  specialties: string[];
  activeReviews: number;
  totalAssigned: number;
  totalCompleted: number;
  responseRate: number;
  alreadyAssigned: boolean;
  /** درجة الملاءمة 0-100 */
  score: number;
}

/**
 * يقترح محكمين مناسبين لعمل علمي بناءً على:
 * - مطابقة التخصص (٦٠ نقطة)
 * - معدل الاستجابة (٢٠ نقطة)
 * - العبء الحالي معكوساً (٢٠ نقطة)
 * - يستبعد المحكمين الموقوفين (active=false)
 * - يضع المحكمين المعيَّنين سابقاً في الأسفل (alreadyAssigned=true)
 */
export async function suggestReviewers(
  workId: string
): Promise<ReviewerSuggestion[]> {
  const work = await prisma.scientificWork.findUnique({
    where: { id: workId },
    select: { specialty: true },
  });
  if (!work) return [];

  const reviewers = await prisma.reviewer.findMany({
    where: { active: true },
    include: {
      user: { select: { name: true } },
      reviews: {
        where: {
          status: { in: ["ASSIGNED", "IN_PROGRESS"] },
        },
        select: { id: true, workId: true },
      },
    },
  });

  const suggestions: ReviewerSuggestion[] = reviewers.map((r) => {
    const matches = r.specialties.includes(work.specialty);
    const activeReviews = r.reviews.length;
    const alreadyAssigned = r.reviews.some((rv) => rv.workId === workId);
    const responseRate =
      r.totalAssigned > 0
        ? Math.round((r.totalCompleted / r.totalAssigned) * 100)
        : 100; // محكم جديد = درجة مثالية افتراضياً
    const loadPenalty = Math.min(activeReviews * 5, 20); // كل مراجعة نشطة = -٥ نقاط، حد ٢٠

    let score = 0;
    if (matches) score += 60;
    score += Math.round((responseRate / 100) * 20); // ٢٠ كحد أقصى
    score += Math.max(0, 20 - loadPenalty);
    if (alreadyAssigned) score = Math.max(0, score - 50);

    return {
      reviewerId: r.id,
      name: r.user.name ?? "محكم",
      expertise: r.expertise,
      specialties: r.specialties,
      activeReviews,
      totalAssigned: r.totalAssigned,
      totalCompleted: r.totalCompleted,
      responseRate,
      alreadyAssigned,
      score,
    };
  });

  // ترتيب: غير المعيَّنين أولاً، ثم بالدرجة تنازلياً
  suggestions.sort((a, b) => {
    if (a.alreadyAssigned !== b.alreadyAssigned) {
      return a.alreadyAssigned ? 1 : -1;
    }
    return b.score - a.score;
  });

  return suggestions;
}

// ————————————————————————————————
// إنشاء مراجعة (تعيين محكم لعمل)
// ————————————————————————————————

export async function assignReviewer(
  workId: string,
  reviewerId: string,
  dueDate?: Date
): Promise<{ ok: true; reviewId: string } | { ok: false; error: string }> {
  // تحقّق من العمل والمحكم
  const work = await prisma.scientificWork.findUnique({
    where: { id: workId },
    select: { id: true, deadline: true },
  });
  if (!work) return { ok: false, error: "العمل غير موجود" };

  const reviewer = await prisma.reviewer.findUnique({
    where: { id: reviewerId },
    select: { id: true, active: true },
  });
  if (!reviewer) return { ok: false, error: "المحكم غير موجود" };
  if (!reviewer.active)
    return { ok: false, error: "هذا المحكم غير نشط حالياً" };

  // تحقّق من عدم التكرار
  const existing = await prisma.review.findUnique({
    where: { workId_reviewerId: { workId, reviewerId } },
  });
  if (existing)
    return { ok: false, error: "هذا المحكم مكلَّف بالفعل بهذا العمل" };

  // الموعد الافتراضي: أسبوعان قبل deadline العمل، أو ١٤ يوم من الآن
  let due = dueDate ?? null;
  if (!due) {
    const candidate = new Date(work.deadline);
    candidate.setDate(candidate.getDate() - 14);
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 14);
    due = candidate > new Date() ? candidate : fallback;
  }

  const created = await prisma.review.create({
    data: {
      workId,
      reviewerId,
      status: "ASSIGNED",
      dueDate: due,
    },
  });

  await prisma.reviewer.update({
    where: { id: reviewerId },
    data: { totalAssigned: { increment: 1 } },
  });

  return { ok: true, reviewId: created.id };
}

// ————————————————————————————————
// Serializers
// ————————————————————————————————

interface DbReviewer {
  id: string;
  userId: string;
  expertise: string | null;
  specialties: string[];
  active: boolean;
  totalAssigned: number;
  totalCompleted: number;
  createdAt: Date;
  user: { name: string | null; email: string };
}

export function serializeReviewer(r: DbReviewer): ReviewerDto {
  const responseRate =
    r.totalAssigned > 0
      ? Math.round((r.totalCompleted / r.totalAssigned) * 100)
      : 100;
  return {
    id: r.id,
    userId: r.userId,
    name: r.user.name ?? r.user.email,
    email: r.user.email,
    expertise: r.expertise,
    specialties: r.specialties,
    active: r.active,
    totalAssigned: r.totalAssigned,
    totalCompleted: r.totalCompleted,
    responseRate,
    createdAt: r.createdAt.toISOString(),
  };
}

interface DbReviewWithWork {
  id: string;
  status: string;
  decision: string | null;
  scientificScore: number | null;
  linguisticScore: number | null;
  methodologyScore: number | null;
  recommendations: string | null;
  notesToEditor: string | null;
  assignedAt: Date;
  dueDate: Date | null;
  submittedAt: Date | null;
  work: {
    id: string;
    title: string;
    specialty: string;
    track: string;
    notes: string | null;
  };
}

/** يحجب أي معلومات تعريفية عن الباحث (الكود، الاسم) */
function blindWork(w: DbReviewWithWork["work"]): BlindWorkDto {
  return {
    id: w.id,
    title: w.title,
    specialty: w.specialty,
    track: w.track,
    notes: w.notes,
  };
}

export function serializeReviewForReviewer(
  r: DbReviewWithWork
): ReviewerReviewDto {
  return {
    id: r.id,
    status: r.status as ReviewStatus,
    decision: r.decision as ReviewDecision | null,
    scientificScore: r.scientificScore,
    linguisticScore: r.linguisticScore,
    methodologyScore: r.methodologyScore,
    recommendations: r.recommendations,
    notesToEditor: r.notesToEditor,
    assignedAt: r.assignedAt.toISOString(),
    dueDate: r.dueDate?.toISOString() ?? null,
    submittedAt: r.submittedAt?.toISOString() ?? null,
    work: blindWork(r.work),
  };
}

interface DbReviewFull {
  id: string;
  status: string;
  decision: string | null;
  scientificScore: number | null;
  linguisticScore: number | null;
  methodologyScore: number | null;
  recommendations: string | null;
  notesToEditor: string | null;
  assignedAt: Date;
  dueDate: Date | null;
  submittedAt: Date | null;
  lastRemindedAt: Date | null;
  reviewer: {
    id: string;
    user: { name: string | null; email: string };
  };
  work: {
    id: string;
    code: string;
    title: string;
    specialty: string;
    track: string;
    notes: string | null;
    researcher: { displayName: string };
  };
}

export function serializeReviewForCoordinator(
  r: DbReviewFull
): CoordinatorReviewDto {
  return {
    id: r.id,
    status: r.status as ReviewStatus,
    decision: r.decision as ReviewDecision | null,
    scientificScore: r.scientificScore,
    linguisticScore: r.linguisticScore,
    methodologyScore: r.methodologyScore,
    recommendations: r.recommendations,
    notesToEditor: r.notesToEditor,
    assignedAt: r.assignedAt.toISOString(),
    dueDate: r.dueDate?.toISOString() ?? null,
    submittedAt: r.submittedAt?.toISOString() ?? null,
    work: blindWork({
      id: r.work.id,
      title: r.work.title,
      specialty: r.work.specialty,
      track: r.work.track,
      notes: r.work.notes,
    }),
    reviewer: {
      id: r.reviewer.id,
      name: r.reviewer.user.name ?? r.reviewer.user.email,
      email: r.reviewer.user.email,
    },
    workCode: r.work.code,
    researcher: r.work.researcher.displayName,
    lastRemindedAt: r.lastRemindedAt?.toISOString() ?? null,
  };
}

// ————————————————————————————————
// التحقق من المدخلات
// ————————————————————————————————

export function validateSubmitInput(input: unknown):
  | { ok: true; data: ReviewSubmitInput }
  | { ok: false; error: string } {
  if (!input || typeof input !== "object")
    return { ok: false, error: "بيانات غير صالحة" };
  const i = input as Partial<ReviewSubmitInput>;

  function checkScore(v: unknown, label: string): number | string {
    if (typeof v !== "number" || !Number.isInteger(v) || v < 1 || v > 10) {
      return `${label} يجب أن يكون رقماً صحيحاً بين ١ و ١٠`;
    }
    return v;
  }
  const sci = checkScore(i.scientificScore, "التقييم العلمي");
  if (typeof sci === "string") return { ok: false, error: sci };
  const lin = checkScore(i.linguisticScore, "التقييم اللغوي");
  if (typeof lin === "string") return { ok: false, error: lin };
  const meth = checkScore(i.methodologyScore, "التقييم المنهجي");
  if (typeof meth === "string") return { ok: false, error: meth };

  if (
    !i.decision ||
    typeof i.decision !== "string" ||
    !VALID_DECISIONS.includes(i.decision as ReviewDecision)
  ) {
    return { ok: false, error: "قرار التحكيم غير صالح" };
  }
  if (
    !i.recommendations ||
    typeof i.recommendations !== "string" ||
    i.recommendations.trim().length < 20
  ) {
    return {
      ok: false,
      error: "ملاحظات التحكيم يجب ألا تقل عن ٢٠ حرفاً",
    };
  }

  return {
    ok: true,
    data: {
      scientificScore: sci,
      linguisticScore: lin,
      methodologyScore: meth,
      decision: i.decision as ReviewDecision,
      recommendations: i.recommendations.trim(),
      notesToEditor:
        typeof i.notesToEditor === "string" && i.notesToEditor.trim()
          ? i.notesToEditor.trim()
          : undefined,
    },
  };
}

// ————————————————————————————————
// تحقّق الملكية: المحكم لمراجعاته الخاصة
// ————————————————————————————————

export async function reviewBelongsToUser(
  reviewId: string,
  userId: string
): Promise<boolean> {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { reviewer: { select: { userId: true } } },
  });
  return review?.reviewer.userId === userId;
}
