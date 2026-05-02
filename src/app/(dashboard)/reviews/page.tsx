"use client";

// صفحة المراجعات
// — REVIEWER: يرى مراجعاته الخاصة معمَّاة
// — COORDINATORs/ADMIN: يرون كل المراجعات (مع بيانات الباحث)
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  AlertTriangle,
  Calendar,
  ClipboardList,
  Eye,
  RefreshCw,
  BellRing,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import {
  REVIEW_STATUS_LABEL,
  REVIEW_DECISION_LABEL,
  reviewStatusTone,
  reviewDecisionTone,
  type CoordinatorReviewDto,
  type ReviewerReviewDto,
} from "@/types/reviews";
import {
  SPECIALTY_LABEL,
  TRACK_LABEL,
  trackTone,
  type WorkSpecialty,
  type WorkTrack,
} from "@/types/works";
import { cn, formatDate, toArabicDigits } from "@/lib/utils";

type AnyReview = ReviewerReviewDto | CoordinatorReviewDto;

function isCoordView(r: AnyReview): r is CoordinatorReviewDto {
  return "researcher" in r;
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export default function ReviewsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const isReviewer = role === "REVIEWER";
  const toast = useToast();

  const [reviews, setReviews] = useState<AnyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminding, setReminding] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.ok)
        throw new Error(json.error || "فشل التحميل");
      setReviews((json.reviews ?? []) as AnyReview[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const stats = useMemo(() => {
    const pending = reviews.filter(
      (r) => r.status === "ASSIGNED" || r.status === "IN_PROGRESS"
    ).length;
    const submitted = reviews.filter((r) => r.status === "SUBMITTED").length;
    const overdue = reviews.filter((r) => {
      if (r.status === "SUBMITTED" || r.status === "DECLINED") return false;
      const d = daysUntil(r.dueDate);
      return d !== null && d < 0;
    }).length;
    return { total: reviews.length, pending, submitted, overdue };
  }, [reviews]);

  async function sendReminder(reviewId: string) {
    setReminding(reviewId);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/remind`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.ok)
        throw new Error(json.error || "فشل التذكير");
      // حدّث lastRemindedAt محلياً
      setReviews((all) =>
        all.map((r) =>
          r.id === reviewId && isCoordView(r)
            ? { ...r, lastRemindedAt: json.lastRemindedAt }
            : r
        )
      );
      toast.success("تمّ تسجيل التذكير");
    } catch (e) {
      toast.error("تعذّر التذكير", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setReminding(null);
    }
  }

  if (error && reviews.length === 0) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="تعذّر تحميل المراجعات"
        description={error}
        action={
          <Button variant="primary" onClick={() => void refetch()}>
            <RefreshCw className="h-4 w-4" />
            إعادة المحاولة
          </Button>
        }
        className="border-red-200 bg-red-50/30"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-saei-purple-700 mb-1 flex items-center gap-2">
            <ClipboardList className="h-7 w-7" />
            {isReviewer ? "مراجعاتي" : "المراجعات"}
          </h1>
          <p className="text-stone-600 text-sm">
            {isReviewer
              ? "الأعمال العلمية المكلَّف بتحكيمها — هوية الباحث محجوبة"
              : "متابعة جميع المراجعات في النظام"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void refetch()}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          تحديث
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="إجمالي"
          value={stats.total}
          color="text-saei-purple"
          bg="bg-saei-purple/10"
        />
        <KpiCard
          label="قيد التحكيم"
          value={stats.pending}
          color="text-amber-700"
          bg="bg-amber-100"
        />
        <KpiCard
          label="مكتملة"
          value={stats.submitted}
          color="text-emerald-700"
          bg="bg-emerald-100"
        />
        <KpiCard
          label="متأخرة"
          value={stats.overdue}
          color="text-red-700"
          bg="bg-red-100"
        />
      </div>

      {loading && reviews.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={
            isReviewer ? "لا توجد مراجعات حالياً" : "لا توجد مراجعات في النظام"
          }
          description={
            isReviewer
              ? "ستظهر هنا الأعمال المكلَّف بتحكيمها فور إسنادها إليك."
              : "ابدأ بإسناد محكمين للأعمال من صفحة الأعمال العلمية."
          }
          variant="subtle"
        />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <ReviewListItem
              key={r.id}
              review={r}
              isReviewerView={isReviewer}
              reminding={reminding === r.id}
              onRemind={() => void sendReminder(r.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className="rounded-2xl border border-saei-purple-100 bg-white p-4 flex items-center gap-3">
      <div className={cn("h-11 w-11 rounded-xl grid place-items-center", bg, color)}>
        <ClipboardList className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs text-stone-600">{label}</div>
        <div className={cn("text-2xl font-extrabold tabular-nums", color)}>
          {toArabicDigits(value)}
        </div>
      </div>
    </div>
  );
}

function ReviewListItem({
  review,
  isReviewerView,
  reminding,
  onRemind,
}: {
  review: AnyReview;
  isReviewerView: boolean;
  reminding: boolean;
  onRemind: () => void;
}) {
  const days = daysUntil(review.dueDate);
  const overdue =
    days !== null &&
    days < 0 &&
    review.status !== "SUBMITTED" &&
    review.status !== "DECLINED";
  const dueSoon =
    days !== null &&
    days >= 0 &&
    days <= 3 &&
    review.status !== "SUBMITTED" &&
    review.status !== "DECLINED";

  const w = review.work;
  const coordView = isCoordView(review) ? review : null;

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-4 sm:p-5 space-y-3",
        overdue
          ? "border-red-200 bg-red-50/30"
          : "border-saei-purple-100"
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:justify-between">
        <div className="flex-1 min-w-0">
          {coordView ? (
            <div className="text-xs text-stone-500 ltr text-left mb-1">
              {coordView.workCode}
            </div>
          ) : (
            <div className="text-xs text-stone-500 mb-1 flex items-center gap-1.5">
              <Eye className="h-3 w-3" />
              <span>هوية الباحث محجوبة</span>
            </div>
          )}
          <h3 className="font-bold text-saei-purple-700 leading-tight text-base">
            {w.title}
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Badge variant={reviewStatusTone(review.status)}>
              {REVIEW_STATUS_LABEL[review.status]}
            </Badge>
            <Badge variant={trackTone(w.track as WorkTrack)}>
              {TRACK_LABEL[w.track as WorkTrack] ?? w.track}
            </Badge>
            <Badge variant="purple">
              {SPECIALTY_LABEL[w.specialty as WorkSpecialty] ?? w.specialty}
            </Badge>
            {review.decision && (
              <Badge variant={reviewDecisionTone(review.decision)}>
                {REVIEW_DECISION_LABEL[review.decision]}
              </Badge>
            )}
            {overdue && <Badge variant="red">متأخر</Badge>}
            {dueSoon && !overdue && (
              <Badge variant="amber">يستحق قريباً</Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isReviewerView && review.status !== "DECLINED" && (
            <Button asChild variant="primary" size="sm">
              <Link href={`/reviews/${review.id}`}>
                {review.status === "SUBMITTED" ? "عرض" : "فتح المراجعة"}
              </Link>
            </Button>
          )}
          {!isReviewerView && (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href={`/reviews/${review.id}`}>عرض</Link>
              </Button>
              {(review.status === "ASSIGNED" ||
                review.status === "IN_PROGRESS") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemind}
                  disabled={reminding}
                >
                  <BellRing
                    className={`h-3.5 w-3.5 ${reminding ? "animate-pulse" : ""}`}
                  />
                  تذكير
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600 pt-3 border-t border-saei-purple-100">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3" />
          <span>تكليف:</span>
          <span className="text-stone-700">{formatDate(review.assignedAt)}</span>
        </div>
        {review.dueDate && (
          <div className="flex items-center gap-1.5">
            <Clock
              className={cn(
                "h-3 w-3",
                overdue && "text-red-600",
                dueSoon && "text-amber-600"
              )}
            />
            <span>الموعد النهائي:</span>
            <span
              className={cn(
                "font-bold",
                overdue ? "text-red-700" : dueSoon ? "text-amber-700" : "text-stone-700"
              )}
            >
              {formatDate(review.dueDate)}
              {days !== null &&
                review.status !== "SUBMITTED" &&
                review.status !== "DECLINED" && (
                  <span className="ms-1 opacity-70">
                    {days < 0
                      ? `(منذ ${toArabicDigits(Math.abs(days))} يوم)`
                      : days === 0
                        ? "(اليوم)"
                        : `(${toArabicDigits(days)} يوم)`}
                  </span>
                )}
            </span>
          </div>
        )}
        {coordView && (
          <div className="flex items-center gap-1.5">
            <span>المحكم:</span>
            <span className="font-bold text-saei-purple-700">
              {coordView.reviewer.name}
            </span>
          </div>
        )}
        {coordView?.lastRemindedAt && (
          <div className="text-stone-500">
            آخر تذكير: {formatDate(coordView.lastRemindedAt)}
          </div>
        )}
      </div>
    </div>
  );
}
