"use client";

// نافذة إضافة/تعديل محكم — تخصصات multi-select كـchips
import { useEffect, useMemo, useState } from "react";
import { Save, Check } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { SPECIALTY_LABEL, type WorkSpecialty } from "@/types/works";
import type { ReviewerDto } from "@/types/reviews";

const ALL_SPECIALTIES: WorkSpecialty[] = [
  "HADITH",
  "USUL",
  "TAFSIR",
  "AQEEDAH",
  "FIQH",
  "SEERAH",
  "ARABIC",
  "BIO",
];

export interface ReviewerFormValues {
  email: string;
  name: string;
  password: string;
  expertise: string;
  specialties: string[];
  active: boolean;
}

const EMPTY: ReviewerFormValues = {
  email: "",
  name: "",
  password: "",
  expertise: "",
  specialties: [],
  active: true,
};

type Errors = Partial<Record<keyof ReviewerFormValues, string>>;

function validate(v: ReviewerFormValues, isEdit: boolean): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = "الاسم قصير جداً";
  if (!v.email.includes("@") || !v.email.includes("."))
    e.email = "البريد الإلكتروني غير صحيح";
  if (!isEdit && v.password.length < 8)
    e.password = "كلمة المرور يجب ألا تقل عن ٨ أحرف";
  if (v.specialties.length === 0)
    e.specialties = "اختر تخصصاً واحداً على الأقل";
  return e;
}

interface Props {
  open: boolean;
  initial?: ReviewerDto | null;
  submitting?: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (values: ReviewerFormValues) => void;
}

export function ReviewerDialog({
  open,
  initial,
  submitting = false,
  onOpenChange,
  onSubmit,
}: Props) {
  const isEdit = !!initial;
  const [values, setValues] = useState<ReviewerFormValues>(EMPTY);
  const [touched, setTouched] = useState<Set<keyof ReviewerFormValues>>(
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
              email: initial.email,
              name: initial.name,
              password: "",
              expertise: initial.expertise ?? "",
              specialties: initial.specialties,
              active: initial.active,
            }
          : EMPTY
      );
    }
  }, [open, initial]);

  const errors = useMemo(() => validate(values, isEdit), [values, isEdit]);
  const isValid = Object.keys(errors).length === 0;
  const errorOf = (k: keyof ReviewerFormValues): string | null =>
    submitAttempted || touched.has(k) ? errors[k] ?? null : null;
  const blur = (k: keyof ReviewerFormValues) =>
    setTouched((s) => new Set(s).add(k));

  function toggleSpec(s: WorkSpecialty) {
    setValues((v) => {
      const has = v.specialties.includes(s);
      return {
        ...v,
        specialties: has
          ? v.specialties.filter((x) => x !== s)
          : [...v.specialties, s],
      };
    });
    blur("specialties");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!isValid) return;
    onSubmit(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "تعديل محكم" : "إضافة محكم جديد"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "حدّث بيانات المحكم وتخصصاته."
              : "أنشئ حساب محكم جديد وحدّد تخصصاته."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="الاسم الكامل" required error={errorOf("name")}>
              {(p) => (
                <Input
                  {...p}
                  value={values.name}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, name: e.target.value }))
                  }
                  onBlur={() => blur("name")}
                  placeholder="أ.د. محمد البشير"
                  autoComplete="name"
                />
              )}
            </FormField>

            <FormField
              label="البريد الإلكتروني"
              required
              error={errorOf("email")}
            >
              {(p) => (
                <Input
                  {...p}
                  type="email"
                  value={values.email}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, email: e.target.value }))
                  }
                  onBlur={() => blur("email")}
                  placeholder="reviewer@saei.local"
                  className="ltr text-left"
                  disabled={isEdit}
                />
              )}
            </FormField>
          </div>

          {!isEdit && (
            <FormField
              label="كلمة المرور"
              required
              error={errorOf("password")}
              hint="٨ أحرف على الأقل — يستخدمها المحكم لتسجيل الدخول"
            >
              {(p) => (
                <Input
                  {...p}
                  type="password"
                  value={values.password}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, password: e.target.value }))
                  }
                  onBlur={() => blur("password")}
                  autoComplete="new-password"
                />
              )}
            </FormField>
          )}

          <FormField label="مجال الخبرة" hint="وصف مختصر يظهر للمنسقين">
            {(p) => (
              <Textarea
                {...p}
                value={values.expertise}
                onChange={(e) =>
                  setValues((v) => ({ ...v, expertise: e.target.value }))
                }
                placeholder="مثال: علوم الحديث والتخريج، التحقيق الشرعي"
                rows={2}
              />
            )}
          </FormField>

          {/* التخصصات multi-select */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1">
              التخصصات
              <span className="text-saei-gold-700 text-xs">*</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {ALL_SPECIALTIES.map((s) => {
                const active = values.specialties.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpec(s)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border transition-colors",
                      active
                        ? "bg-saei-purple text-white border-saei-purple shadow-saei-sm"
                        : "bg-white text-saei-purple-700 border-saei-purple-200 hover:bg-saei-purple-50"
                    )}
                  >
                    {active && <Check className="h-3 w-3" />}
                    {SPECIALTY_LABEL[s]}
                  </button>
                );
              })}
            </div>
            {errorOf("specialties") && (
              <p className="text-xs text-red-700 mt-1">
                {errorOf("specialties")}
              </p>
            )}
          </div>

          {isEdit && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={values.active}
                onChange={(e) =>
                  setValues((v) => ({ ...v, active: e.target.checked }))
                }
                className="h-4 w-4 rounded accent-saei-purple"
              />
              <span className="text-sm">
                المحكم نشط ويستقبل تكليفات جديدة
              </span>
            </label>
          )}

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
                  : "إضافة المحكم"}
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
