"use client";

// نافذة إضافة/تعديل مستخدم — مع validation real-time
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
import { FormField } from "@/components/ui/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABEL, ALL_ROLES } from "@/lib/rbac";
import type { UserRole } from "@/types";

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string;
}

export interface UserFormValues {
  email: string;
  name: string;
  role: UserRole;
  password: string;
}

const EMPTY: UserFormValues = {
  email: "",
  name: "",
  role: "RESEARCHER",
  password: "",
};

type Errors = Partial<Record<keyof UserFormValues, string>>;

function validate(v: UserFormValues, isEdit: boolean): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = "الاسم قصير جداً";
  if (!v.email.includes("@") || !v.email.includes("."))
    e.email = "البريد الإلكتروني غير صحيح";
  if (!isEdit && v.password.length < 8)
    e.password = "كلمة المرور يجب ألا تقل عن ٨ أحرف";
  if (isEdit && v.password.length > 0 && v.password.length < 8)
    e.password = "الكلمة الجديدة يجب ألا تقل عن ٨ أحرف";
  return e;
}

interface Props {
  open: boolean;
  initial?: UserRow | null;
  submitting?: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (values: UserFormValues) => void;
}

export function UserDialog({
  open,
  initial,
  submitting = false,
  onOpenChange,
  onSubmit,
}: Props) {
  const isEdit = !!initial;
  const [values, setValues] = useState<UserFormValues>(EMPTY);
  const [touched, setTouched] = useState<Set<keyof UserFormValues>>(
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
              name: initial.name ?? "",
              role: initial.role,
              password: "",
            }
          : EMPTY
      );
    }
  }, [open, initial]);

  const errors = useMemo(() => validate(values, isEdit), [values, isEdit]);
  const isValid = Object.keys(errors).length === 0;

  const errorOf = (k: keyof UserFormValues): string | null =>
    submitAttempted || touched.has(k) ? errors[k] ?? null : null;

  const blur = (k: keyof UserFormValues) =>
    setTouched((s) => new Set(s).add(k));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!isValid) return;
    onSubmit(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "تعديل مستخدم" : "إضافة مستخدم جديد"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "حدّث بيانات الحساب — اترك كلمة المرور فارغة للإبقاء عليها."
              : "أنشئ حساباً جديداً وحدّد دوره في النظام."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2" noValidate>
          <FormField
            label="الاسم الكامل"
            required
            error={errorOf("name")}
          >
            {(p) => (
              <Input
                {...p}
                value={values.name}
                onChange={(e) =>
                  setValues((v) => ({ ...v, name: e.target.value }))
                }
                onBlur={() => blur("name")}
                placeholder="مثال: د. عبدالله السالم"
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
                placeholder="user@saei.local"
                className="ltr text-left"
                autoComplete="email"
              />
            )}
          </FormField>

          <div className="space-y-1.5">
            <Label htmlFor="u-role" className="flex items-center gap-1">
              الدور
              <span className="text-saei-gold-700 text-xs">*</span>
            </Label>
            <Select
              value={values.role}
              onValueChange={(v) =>
                setValues((old) => ({ ...old, role: v as UserRole }))
              }
            >
              <SelectTrigger id="u-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <FormField
            label={isEdit ? "كلمة مرور جديدة" : "كلمة المرور"}
            required={!isEdit}
            error={errorOf("password")}
            hint={
              isEdit
                ? "اتركها فارغة للإبقاء على الحالية"
                : "٨ أحرف على الأقل"
            }
          >
            {(p) => (
              <Input
                {...p}
                type="password"
                autoComplete="new-password"
                value={values.password}
                onChange={(e) =>
                  setValues((v) => ({ ...v, password: e.target.value }))
                }
                onBlur={() => blur("password")}
              />
            )}
          </FormField>

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
                  : "إنشاء الحساب"}
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
