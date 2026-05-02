"use client";

// نموذج التحكيم — صفحة كاملة للمحكم وللمنسق
// — REVIEWER: نموذج قابل للتعديل (حفظ مسوّدة + تسليم) — معمَّى
// — COORDINATORs/ADMIN: عرض read-only كامل (مع بيانات المحكم والباحث)
import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Save,
  Send,
  ShieldOff,
  ClipboardList,
  Calendar,
  Eye,
  XCircle,
  CheckCheck,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast";
import { ScoreInput } from "@/components/reviews/ScoreInput";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import {
  REVIEW_DECISION_LABEL,
  REVIEW_STATUS_LABEL,
  reviewDecisionTone,
  reviewStatusTone,
  type CoordinatorReviewDto,
  type ReviewDecision,
  type ReviewerReviewDto,
} from "@/types/reviews";
import {
  SPECIALTY_LABEL,
  TRACK_LABEL,
  trackTone,
  type WorkSpecialty,
  type WorkTrack,
} from "@/types/works";

type AnyReview = ReviewerReviewDto | CoordinatorReviewDto;

function isCoordView(r: AnyReview): r is CoordinatorReviewDto {
  return "researcher" in r;
}

const DECISIONS: { value: ReviewDecision; tone: "green" | "teal" | "amber" | "red" }[] =
  [
    { value: "ACCEPT", tone: "green" },
    { value: "MINOR_REVISION", tone: "teal" },
    { value: "MAJOR_REVISION", tone: "amber" },
    { value: "REJECT", tone: "red" },
  ];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ReviewDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const isReviewer = role === "REVIEWER";
  const toast = useToast();

  const [review, setReview] = useState<AnyReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // حقول النموذج (للمحكم)
  const [scientific, setScientific] = useState<number | null>(null);
  const [linguistic, setLinguistic] = useState<number | null>(null);
  const [methodology, setMethodology] = useState<number | null>(null);
  const [decision, setDecision] = useState<ReviewDecision | null>(null);
  const [recommendations, setRecommendations] = useState("");
  const [notesToEditor, setNotesToEditor] = useState("");

  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [confirmDecline, setConfirmDecline] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/reviews/${id}`, { cache: "no-store" });
        const json = await res.json();
        if (!alive) return;
        if (!res.ok || !json.ok)
          throw new Error(json.error || "فشل التحميل");
        const r = json.review as AnyReview;
        setReview(r);
        setScientific(r.scientificScore);
        setLinguistic(r.linguisticScore);
        setMethodology(r.methodologyScore);
        setDecision(r.decision);
        setRecommendations(r.recommendations ?? "");
        setNotesToEditor(r.notesToEditor ?? "");
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "خطأ");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const isLocked =
    review?.status === "SUBMITTED" || review?.status === "DECLINED";

  const formErrors = useMemo(() => {
    const e: string[] = [];
    if (scientific === null) e.push("التقييم العلمي");
    if (linguistic === null) e.push("التقييم اللغوي");
    if (methodology === null) e.push("التقييم المنهجي");
    if (!decision) e.push("القرار النهائي");
    if (recommendations.trim().length < 20)
      e.push("ملاحظات للباحث (٢٠ حرفاً على الأقل)");
    return e;
  }, [scientific, linguistic, methodology, decision, recommendations]);

  async function saveDraft() {
    if (!review) return;
    setSavingDraft(true);
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scientificScore: scientific,
          linguisticScore: linguistic,
          methodologyScore: methodology,
          decision,
          recommendations,
          notesToEditor,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok)
        throw new Error(json.error || "فشل حفظ المسوّدة");
      setReview(json.review as AnyReview);
      toast.success("تمّ حفظ المسوّدة");
    } catch (e) {
      toast.error("تعذّر الحفظ", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setSavingDraft(false);
    }
  }

  async function submitFinal() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/reviews/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scientificScore: scientific,
          linguisticScore: linguistic,
          methodologyScore: methodology,
          decision,
          recommendations,
          notesToEditor: notesToEditor.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok)
        throw new Error(json.error || "فشل التسليم");
      setReview(json.review as AnyReview);
      setConfirmSubmit(false);
      toast.success("تمّ تسليم المراجعة بنجاح", {
        description: "شكراً لك على تحكيم هذا العمل العلمي",
      });
    } catch (e) {
      toast.error("تعذّر التسليم", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function declineReview() {
    try {
      const res = await fetch(`/api/reviews/${id}/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "فشل الإجراء");
      toast.success("تمّ تسجيل اعتذارك");
      router.push("/reviews");
    } catch (e) {
      toast.error("تعذّر تنفيذ الطلب", {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (error || !review) {
    return (
      <Card>
        <CardHeader className="text-center py-12">
          <AlertTriangle className="h-10 w-10 text-red-600 mx-auto mb-3" />
          <CardTitle>تعذّر تحميل المراجعة</CardTitle>
          <CardDescription>{error ?? "غير موجودة"}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const w = review.work;
  const coordView = isCoordView(review) ? review : null;

  return (
    <div className="space-y-5 max-w-4xl">
      {/* رابط رجوع */}
      <Link
        href="/reviews"
        className="inline-flex items-center gap-1 text-sm text-saei-purple-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        رجوع إلى قائمة المراجعات
      </Link>

      {/* بطاقة العمل */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              {coordView ? (
                <div className="text-xs text-stone-500 ltr text-left mb-1">
                  {coordView.workCode}
                </div>
              ) : (
                <div className="text-xs text-stone-500 mb-1 flex items-center gap-1.5">
                  <Eye className="h-3 w-3" />
                  <span>هوية الباحث محجوبة لضمان عدالة التحكيم</span>
                </div>
              )}
              <CardTitle className="text-xl md:text-2xl">{w.title}</CardTitle>
              <div className="flex flex-wrap gap-1.5 mt-3">
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
              </div>
            </div>
            <div className="text-xs text-stone-600 space-y-1 shrink-0">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>تكليف: {formatDate(review.assignedAt)}</span>
              </div>
              {review.dueDate && (
                <div className="flex items-center gap-1.5">
                  <ClipboardList className="h-3.5 w-3.5" />
                  <span>موعد التسليم: {formatDate(review.dueDate)}</span>
                </div>
              )}
              {review.submittedAt && (
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>سُلِّمت في: {formatDate(review.submittedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {w.notes && (
            <div className="mt-4 rounded-xl bg-saei-purple-50/40 border border-saei-purple-100 p-3">
              <div className="text-xs font-bold text-saei-purple-700 mb-1">
                ملاحظات مرفقة
              </div>
              <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
                {w.notes}
              </p>
            </div>
          )}

          {/* للمنسق فقط: بيانات المحكم والباحث */}
          {coordView && (
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <InfoBox
                label="المحكم"
                value={coordView.reviewer.name}
                subValue={coordView.reviewer.email}
              />
              <InfoBox label="الباحث" value={coordView.researcher} />
            </div>
          )}
        </CardHeader>
      </Card>

      {/* تنبيه السرّية للمحكم */}
      {isReviewer && !isLocked && (
        <div className="rounded-xl bg-saei-teal-50 border border-saei-teal-200 p-4 flex items-start gap-3">
          <ShieldOff className="h-5 w-5 text-saei-teal shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-bold text-saei-purple-700 mb-1">
              تحكيم معمَّى
            </div>
            <p className="text-stone-700 leading-relaxed">
              لضمان عدالة التحكيم، لا تظهر هوية الباحث ولا أي معلومات تعريفية.
              يُرجى الالتزام بالموضوعية في التقييم وتوثيق الملاحظات بأدلة من
              المتن.
            </p>
          </div>
        </div>
      )}

      {/* نموذج التحكيم — للمحكم القابل للتعديل، أو read-only للمنسق */}
      <Card>
        <CardHeader>
          <CardTitle>تقييم المحكم</CardTitle>
          <CardDescription>
            {isLocked
              ? "تمّ التسليم — لا يمكن التعديل"
              : "قيّم العمل من جوانبه الثلاث، ثم أبدِ ملاحظاتك وقرارك النهائي"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ScoreInput
            label="التقييم العلمي"
            description="مدى دقة المحتوى ومطابقته للمصادر، عمق التحليل، وأصالة الأطروحة"
            value={scientific}
            onChange={setScientific}
            disabled={isLocked || !isReviewer}
          />
          <ScoreInput
            label="التقييم اللغوي"
            description="سلامة الأسلوب، فصاحة العبارة، خلو النص من الأخطاء النحوية والإملائية"
            value={linguistic}
            onChange={setLinguistic}
            disabled={isLocked || !isReviewer}
          />
          <ScoreInput
            label="التقييم المنهجي"
            description="بنية البحث، تسلسل الأفكار، توثيق المراجع، وإحكام الاستدلال"
            value={methodology}
            onChange={setMethodology}
            disabled={isLocked || !isReviewer}
          />

          {/* القرار */}
          <div className="space-y-2">
            <Label>القرار النهائي</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DECISIONS.map((d) => {
                const active = decision === d.value;
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDecision(d.value)}
                    disabled={isLocked || !isReviewer}
                    className={cn(
                      "rounded-xl border-2 px-3 py-3 text-sm font-bold transition-all",
                      active
                        ? "border-saei-cyan-700 bg-saei-hero text-white shadow-saei-sm"
                        : "border-saei-purple-200 bg-white text-saei-purple-700 hover:border-saei-cyan-600",
                      (isLocked || !isReviewer) &&
                        "opacity-60 cursor-not-allowed"
                    )}
                  >
                    {REVIEW_DECISION_LABEL[d.value]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* الملاحظات للباحث */}
          <div className="space-y-2">
            <Label htmlFor="recs">
              ملاحظات للباحث (تظهر له بدون كشف هويتك)
              <span className="text-saei-gold-700 me-1 text-xs">*</span>
            </Label>
            <Textarea
              id="recs"
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              disabled={isLocked || !isReviewer}
              rows={6}
              placeholder="فصّل ملاحظاتك التحريرية والتعديلية، مع الإشارة إلى الصفحات والأبواب عند الاقتضاء..."
            />
            <p className="text-xs text-stone-500">
              ٢٠ حرفاً على الأقل — هذه الملاحظات تُرسَل إلى الباحث للعمل بها.
            </p>
          </div>

          {/* الملاحظات للمنسق */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              ملاحظات سرّية للمنسق (اختياري)
            </Label>
            <Textarea
              id="notes"
              value={notesToEditor}
              onChange={(e) => setNotesToEditor(e.target.value)}
              disabled={isLocked || !isReviewer}
              rows={3}
              placeholder="أي ملاحظة لا ترغب في إيصالها للباحث مباشرة..."
            />
            <p className="text-xs text-stone-500">
              لا تُعرض على الباحث — تصل للمنسق فقط.
            </p>
          </div>

          {/* أزرار العمل (للمحكم فقط) */}
          {isReviewer && !isLocked && (
            <>
              {formErrors.length > 0 && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                  <div className="font-bold mb-1">
                    قبل التسليم، أكمل الحقول التالية:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {formErrors.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2 border-t border-saei-purple-100">
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setConfirmSubmit(true)}
                  disabled={formErrors.length > 0 || savingDraft}
                >
                  <Send className="h-4 w-4" />
                  تسليم نهائي
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void saveDraft()}
                  disabled={savingDraft || submitting}
                >
                  <Save className="h-4 w-4" />
                  {savingDraft ? "جاري الحفظ..." : "حفظ مسوّدة"}
                </Button>
                {review.status === "ASSIGNED" && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setConfirmDecline(true)}
                    className="ms-auto text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4" />
                    اعتذار عن التحكيم
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* تأكيد التسليم */}
      <ConfirmDialog
        open={confirmSubmit}
        variant="info"
        title="تسليم المراجعة نهائياً"
        description={
          <>
            بعد التسليم لن تتمكن من تعديل الملاحظات أو الدرجات. تأكَّد من
            مراجعة جميع الحقول.
            <br />
            <br />
            القرار النهائي:{" "}
            <strong className="text-saei-purple-700">
              {decision ? REVIEW_DECISION_LABEL[decision] : "—"}
            </strong>
          </>
        }
        confirmLabel="تسليم نهائي"
        loading={submitting}
        onOpenChange={(v) => !submitting && setConfirmSubmit(v)}
        onConfirm={submitFinal}
      />

      {/* تأكيد الاعتذار */}
      <ConfirmDialog
        open={confirmDecline}
        variant="warning"
        title="الاعتذار عن التحكيم"
        description="ستتم إزالة هذه المراجعة من قائمتك، وسيُبلَّغ المنسق ليُعيد إسنادها لمحكم آخر."
        confirmLabel="نعم، اعتذر"
        onOpenChange={setConfirmDecline}
        onConfirm={declineReview}
      />
    </div>
  );
}

function InfoBox({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div className="rounded-xl border border-saei-purple-100 bg-saei-purple-50/30 p-3">
      <div className="text-xs font-bold text-saei-purple-700 mb-1">
        {label}
      </div>
      <div className="font-bold text-saei-ink">{value}</div>
      {subValue && (
        <div className="text-xs text-stone-600 ltr text-left mt-0.5">
          {subValue}
        </div>
      )}
    </div>
  );
}
