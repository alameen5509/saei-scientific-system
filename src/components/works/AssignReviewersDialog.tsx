"use client";

// نافذة تعيين محكمين لعمل علمي — تعرض اقتراحات مرتبة بدرجة الملاءمة
import { useEffect, useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { cn, toArabicDigits } from "@/lib/utils";
import { SPECIALTY_LABEL, type WorkSpecialty } from "@/types/works";
import type { ScientificWork } from "@/types/works";

interface Suggestion {
  reviewerId: string;
  name: string;
  expertise: string | null;
  specialties: string[];
  activeReviews: number;
  totalAssigned: number;
  totalCompleted: number;
  responseRate: number;
  alreadyAssigned: boolean;
  score: number;
}

interface Props {
  open: boolean;
  work: ScientificWork | null;
  onOpenChange: (v: boolean) => void;
  onAssigned?: () => void;
}

export function AssignReviewersDialog({
  open,
  work,
  onOpenChange,
  onAssigned,
}: Props) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !work) return;
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/works/${work.id}/suggest-reviewers`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (!alive) return;
        if (!res.ok || !json.ok)
          throw new Error(json.error || "فشل التحميل");
        setSuggestions((json.suggestions ?? []) as Suggestion[]);
      } catch (e) {
        if (alive)
          toast.error("تعذّر تحميل الاقتراحات", {
            description: e instanceof Error ? e.message : undefined,
          });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [open, work, toast]);

  async function assign(reviewerId: string) {
    if (!work) return;
    setAssigningId(reviewerId);
    try {
      const res = await fetch(`/api/works/${work.id}/assign-reviewer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewerId }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "فشل التعيين");
      toast.success("تمّ تعيين المحكم");
      // حدّث الـsuggestion المعنية
      setSuggestions((all) =>
        all.map((s) =>
          s.reviewerId === reviewerId
            ? {
                ...s,
                alreadyAssigned: true,
                activeReviews: s.activeReviews + 1,
                totalAssigned: s.totalAssigned + 1,
              }
            : s
        )
      );
      onAssigned?.();
    } catch (e) {
      toast.error("تعذّر التعيين", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setAssigningId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-saei-purple-500" />
            تعيين محكمين
          </DialogTitle>
          <DialogDescription>
            {work && (
              <>
                للعمل:{" "}
                <strong className="text-saei-purple-700">
                  «{work.title}»
                </strong>{" "}
                — تخصص:{" "}
                <Badge variant="purple" className="me-1">
                  {SPECIALTY_LABEL[work.specialty as WorkSpecialty] ??
                    work.specialty}
                </Badge>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-2 mt-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <div className="py-12 text-center text-stone-600">
            <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
            <p className="text-sm">
              لا يوجد محكمون نشطون في النظام. أضف محكمين من صفحة{" "}
              <strong>هيئة المحكمين</strong> أولاً.
            </p>
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            {suggestions.map((s, idx) => (
              <SuggestionRow
                key={s.reviewerId}
                s={s}
                rank={idx + 1}
                workSpecialty={work?.specialty}
                assigning={assigningId === s.reviewerId}
                onAssign={() => void assign(s.reviewerId)}
              />
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SuggestionRow({
  s,
  rank,
  workSpecialty,
  assigning,
  onAssign,
}: {
  s: Suggestion;
  rank: number;
  workSpecialty: string | undefined;
  assigning: boolean;
  onAssign: () => void;
}) {
  const matches =
    workSpecialty !== undefined && s.specialties.includes(workSpecialty);
  const top = rank === 1 && !s.alreadyAssigned && matches;

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-3 sm:p-4 flex items-start gap-3",
        top
          ? "border-saei-gold bg-saei-gold-50/40 shadow-saei-sm"
          : s.alreadyAssigned
            ? "border-saei-purple-100 bg-stone-50 opacity-70"
            : "border-saei-purple-100"
      )}
    >
      <div
        className={cn(
          "h-10 w-10 rounded-xl grid place-items-center font-extrabold text-sm shrink-0",
          top
            ? "bg-saei-gold text-white"
            : "bg-saei-purple-100 text-saei-purple-700"
        )}
      >
        {top ? <Sparkles className="h-5 w-5" /> : (
          <GraduationCap className="h-5 w-5" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-saei-purple-700">{s.name}</span>
          {top && <Badge variant="gold">الأنسب</Badge>}
          {s.alreadyAssigned && <Badge variant="gray">مُعيَّن سابقاً</Badge>}
          {!matches && !s.alreadyAssigned && (
            <Badge variant="amber">خارج التخصص</Badge>
          )}
        </div>
        {s.expertise && (
          <p className="text-xs text-stone-600 mt-0.5">{s.expertise}</p>
        )}
        <div className="flex flex-wrap gap-1 mt-1.5">
          {s.specialties.map((sp) => (
            <span
              key={sp}
              className={cn(
                "text-xs px-2 py-0.5 rounded-full font-bold",
                workSpecialty === sp
                  ? "bg-saei-gold-100 text-saei-gold-700 border border-saei-gold-200"
                  : "bg-saei-purple-50 text-saei-purple-700"
              )}
            >
              {SPECIALTY_LABEL[sp as WorkSpecialty] ?? sp}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-stone-600 mt-2">
          <span>
            معدل الاستجابة:{" "}
            <strong className="text-saei-purple-700">
              {toArabicDigits(s.responseRate)}٪
            </strong>
          </span>
          <span>
            مراجعات نشطة:{" "}
            <strong className="text-saei-purple-700">
              {toArabicDigits(s.activeReviews)}
            </strong>
          </span>
          <span>
            الملاءمة:{" "}
            <strong className="text-saei-purple-700">
              {toArabicDigits(s.score)}/١٠٠
            </strong>
          </span>
        </div>
      </div>

      <Button
        variant={top ? "primary" : "outline"}
        size="sm"
        onClick={onAssign}
        disabled={s.alreadyAssigned || assigning}
        className="shrink-0"
      >
        {assigning ? (
          "جاري..."
        ) : s.alreadyAssigned ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5" />
            معيَّن
          </>
        ) : (
          "تعيين"
        )}
      </Button>
    </div>
  );
}
