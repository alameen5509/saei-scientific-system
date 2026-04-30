"use client";

// نافذة إضافة/تعديل عمل علمي + نافذة عرض التفاصيل
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  STAGE_LABEL,
  TRACK_LABEL,
  SPECIALTY_LABEL,
  STAGE_ORDER,
  stageTone,
  trackTone,
  type ScientificWork,
  type WorkStage,
  type WorkTrack,
  type WorkSpecialty,
} from "@/types/works";
import { formatDate, toArabicDigits } from "@/lib/utils";

// ————————————————————————————————
// Form: إضافة/تعديل
// ————————————————————————————————

export interface WorkFormValues {
  code: string;
  title: string;
  specialty: WorkSpecialty;
  track: WorkTrack;
  researcher: string;
  stage: WorkStage;
  progress: number;
  startedAt: string;
  deadline: string;
  notes: string;
}

const EMPTY: WorkFormValues = {
  code: "",
  title: "",
  specialty: "FIQH",
  track: "BOOK",
  researcher: "",
  stage: "PROPOSED",
  progress: 0,
  startedAt: new Date().toISOString().slice(0, 10),
  deadline: "",
  notes: "",
};

interface FormDialogProps {
  open: boolean;
  initial?: ScientificWork | null;
  submitting?: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (values: WorkFormValues) => void;
}

export function WorkFormDialog({
  open,
  initial,
  submitting = false,
  onOpenChange,
  onSubmit,
}: FormDialogProps) {
  const isEdit = !!initial;
  const [values, setValues] = useState<WorkFormValues>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      setValues(
        initial
          ? {
              code: initial.code,
              title: initial.title,
              specialty: initial.specialty,
              track: initial.track,
              researcher: initial.researcher,
              stage: initial.stage,
              progress: initial.progress,
              startedAt: initial.startedAt,
              deadline: initial.deadline,
              notes: initial.notes ?? "",
            }
          : EMPTY
      );
    }
  }, [open, initial]);

  const update = <K extends keyof WorkFormValues>(
    k: K,
    v: WorkFormValues[K]
  ) => setValues((old) => ({ ...old, [k]: v }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.title.trim()) return setError("يجب إدخال عنوان العمل");
    if (!values.researcher.trim()) return setError("يجب تحديد الباحث");
    if (!values.deadline) return setError("يجب تحديد الموعد النهائي");
    onSubmit(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "تعديل عمل علمي" : "إضافة عمل علمي جديد"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "حدّث بيانات العمل العلمي ثم احفظ التغييرات."
              : "أدخل بيانات العمل العلمي الجديد لإضافته إلى المنظومة."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="w-title">عنوان العمل *</Label>
              <Input
                id="w-title"
                value={values.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="مثال: تحقيق كتاب المستصفى"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="w-code">الرمز</Label>
              <Input
                id="w-code"
                value={values.code}
                onChange={(e) => update("code", e.target.value)}
                placeholder="SAEI-2024-XXX"
                className="ltr text-left"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="w-researcher">الباحث *</Label>
              <Input
                id="w-researcher"
                value={values.researcher}
                onChange={(e) => update("researcher", e.target.value)}
                placeholder="د. عبدالله السالم"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>التخصص</Label>
              <Select
                value={values.specialty}
                onValueChange={(v) =>
                  update("specialty", v as WorkSpecialty)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SPECIALTY_LABEL).map(([k, l]) => (
                    <SelectItem key={k} value={k}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>المسار</Label>
              <Select
                value={values.track}
                onValueChange={(v) => update("track", v as WorkTrack)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TRACK_LABEL).map(([k, l]) => (
                    <SelectItem key={k} value={k}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>المرحلة</Label>
              <Select
                value={values.stage}
                onValueChange={(v) => update("stage", v as WorkStage)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGE_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STAGE_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="w-progress">
                نسبة التقدم ({toArabicDigits(values.progress)}٪)
              </Label>
              <Input
                id="w-progress"
                type="range"
                min={0}
                max={100}
                step={1}
                value={values.progress}
                onChange={(e) =>
                  update("progress", Number(e.target.value))
                }
                className="cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="w-start">تاريخ البدء</Label>
              <Input
                id="w-start"
                type="date"
                value={values.startedAt}
                onChange={(e) => update("startedAt", e.target.value)}
                className="ltr text-left"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="w-deadline">الموعد النهائي *</Label>
              <Input
                id="w-deadline"
                type="date"
                value={values.deadline}
                onChange={(e) => update("deadline", e.target.value)}
                className="ltr text-left"
                required
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="w-notes">ملاحظات</Label>
              <Textarea
                id="w-notes"
                value={values.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="أي ملاحظات خاصة بالعمل..."
                rows={3}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="submit" variant="primary" disabled={submitting}>
              <Save className="h-4 w-4" />
              {submitting
                ? "جاري الحفظ..."
                : isEdit
                  ? "حفظ التغييرات"
                  : "إضافة العمل"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              إلغاء
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ————————————————————————————————
// Dialog: عرض التفاصيل (read-only)
// ————————————————————————————————

interface ViewDialogProps {
  open: boolean;
  work: ScientificWork | null;
  onOpenChange: (v: boolean) => void;
}

export function WorkViewDialog({ open, work, onOpenChange }: ViewDialogProps) {
  if (!work) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="text-xs text-stone-500 ltr text-left mb-1">
            {work.code}
          </div>
          <DialogTitle className="text-2xl">{work.title}</DialogTitle>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Badge variant={stageTone(work.stage)}>
              {STAGE_LABEL[work.stage]}
            </Badge>
            <Badge variant={trackTone(work.track)}>
              {TRACK_LABEL[work.track]}
            </Badge>
            <Badge variant="purple">{SPECIALTY_LABEL[work.specialty]}</Badge>
          </div>
        </DialogHeader>

        <dl className="grid gap-3 sm:grid-cols-2 text-sm mt-4">
          <div>
            <dt className="font-bold text-saei-purple-700 mb-1">الباحث</dt>
            <dd>{work.researcher}</dd>
          </div>
          <div>
            <dt className="font-bold text-saei-purple-700 mb-1">نسبة التقدم</dt>
            <dd className="tabular-nums">
              {toArabicDigits(work.progress)}٪
            </dd>
          </div>
          <div>
            <dt className="font-bold text-saei-purple-700 mb-1">تاريخ البدء</dt>
            <dd>{formatDate(work.startedAt)}</dd>
          </div>
          <div>
            <dt className="font-bold text-saei-purple-700 mb-1">
              الموعد النهائي
            </dt>
            <dd>{formatDate(work.deadline)}</dd>
          </div>
          {work.notes && (
            <div className="sm:col-span-2">
              <dt className="font-bold text-saei-purple-700 mb-1">ملاحظات</dt>
              <dd className="leading-relaxed text-stone-700">{work.notes}</dd>
            </div>
          )}
        </dl>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
