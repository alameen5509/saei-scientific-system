"use client";

// نوافذ إضافة/تعديل + عرض تفاصيل عمل علمي
// — validation real-time لكل حقل + رسائل خطأ تحت الحقل
import { useEffect, useMemo, useState } from "react";
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
import { FormField } from "@/components/ui/form-field";
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
// نموذج البيانات والتحقق
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

type Errors = Partial<Record<keyof WorkFormValues, string>>;

function validate(v: WorkFormValues): Errors {
  const e: Errors = {};
  if (!v.title.trim()) e.title = "عنوان العمل مطلوب";
  else if (v.title.trim().length < 5)
    e.title = "العنوان قصير جداً (٥ أحرف على الأقل)";
  if (!v.researcher.trim()) e.researcher = "اسم الباحث مطلوب";
  else if (v.researcher.trim().length < 3) e.researcher = "اسم قصير جداً";
  if (!v.deadline) e.deadline = "الموعد النهائي مطلوب";
  if (v.startedAt && v.deadline && v.startedAt > v.deadline)
    e.deadline = "الموعد النهائي يجب أن يكون بعد تاريخ البدء";
  if (v.progress < 0 || v.progress > 100)
    e.progress = "نسبة التقدم بين ٠ و ١٠٠";
  return e;
}

// ————————————————————————————————
// نافذة الإضافة/التعديل
// ————————————————————————————————

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
  const [touched, setTouched] = useState<Set<keyof WorkFormValues>>(
    new Set()
  );
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (open) {
      setTouched(new Set());
      setSubmitAttempted(false);
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

  const errors = useMemo(() => validate(values), [values]);
  const isValid = Object.keys(errors).length === 0;

  // أظهر الخطأ بعد لمس الحقل أو عند محاولة الإرسال
  const errorOf = (k: keyof WorkFormValues): string | null =>
    submitAttempted || touched.has(k) ? errors[k] ?? null : null;

  const update = <K extends keyof WorkFormValues>(
    k: K,
    v: WorkFormValues[K]
  ) => setValues((old) => ({ ...old, [k]: v }));

  const blur = (k: keyof WorkFormValues) =>
    setTouched((s) => new Set(s).add(k));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!isValid) return;
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

        <form onSubmit={handleSubmit} className="space-y-4 mt-2" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="عنوان العمل"
              required
              error={errorOf("title")}
              className="sm:col-span-2"
            >
              {(p) => (
                <Input
                  {...p}
                  value={values.title}
                  onChange={(e) => update("title", e.target.value)}
                  onBlur={() => blur("title")}
                  placeholder="مثال: تحقيق كتاب المستصفى"
                />
              )}
            </FormField>

            <FormField
              label="الرمز"
              hint="يُولَّد تلقائياً إن تُرك فارغاً"
            >
              {(p) => (
                <Input
                  {...p}
                  value={values.code}
                  onChange={(e) => update("code", e.target.value)}
                  placeholder="SAEI-2024-XXX"
                  className="ltr text-left"
                />
              )}
            </FormField>

            <FormField
              label="الباحث"
              required
              error={errorOf("researcher")}
            >
              {(p) => (
                <Input
                  {...p}
                  value={values.researcher}
                  onChange={(e) => update("researcher", e.target.value)}
                  onBlur={() => blur("researcher")}
                  placeholder="د. عبدالله السالم"
                />
              )}
            </FormField>

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

            <FormField label="تاريخ البدء">
              {(p) => (
                <Input
                  {...p}
                  type="date"
                  value={values.startedAt}
                  onChange={(e) => update("startedAt", e.target.value)}
                  className="ltr text-left"
                />
              )}
            </FormField>

            <FormField
              label="الموعد النهائي"
              required
              error={errorOf("deadline")}
            >
              {(p) => (
                <Input
                  {...p}
                  type="date"
                  value={values.deadline}
                  onChange={(e) => update("deadline", e.target.value)}
                  onBlur={() => blur("deadline")}
                  className="ltr text-left"
                />
              )}
            </FormField>

            <FormField label="ملاحظات" className="sm:col-span-2">
              {(p) => (
                <Textarea
                  {...p}
                  value={values.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="أي ملاحظات خاصة بالعمل..."
                  rows={3}
                />
              )}
            </FormField>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="submit"
              variant="primary"
              disabled={submitting || (submitAttempted && !isValid)}
            >
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
// نافذة عرض التفاصيل
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
