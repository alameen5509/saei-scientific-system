"use client";

// نافذة إضافة/تعديل مستخدم
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.email.includes("@"))
      return setError("البريد الإلكتروني غير صحيح");
    if (values.name.trim().length < 2) return setError("الاسم قصير جداً");
    if (!isEdit && values.password.length < 8)
      return setError("كلمة المرور يجب ألا تقل عن ٨ أحرف");
    if (isEdit && values.password.length > 0 && values.password.length < 8)
      return setError("كلمة المرور الجديدة يجب ألا تقل عن ٨ أحرف");
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

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="u-name">الاسم الكامل *</Label>
            <Input
              id="u-name"
              value={values.name}
              onChange={(e) =>
                setValues((v) => ({ ...v, name: e.target.value }))
              }
              placeholder="مثال: د. عبدالله السالم"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="u-email">البريد الإلكتروني *</Label>
            <Input
              id="u-email"
              type="email"
              value={values.email}
              onChange={(e) =>
                setValues((v) => ({ ...v, email: e.target.value }))
              }
              placeholder="user@saei.local"
              className="ltr text-left"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="u-role">الدور *</Label>
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

          <div className="space-y-1.5">
            <Label htmlFor="u-pw">
              {isEdit
                ? "كلمة مرور جديدة (اختياري)"
                : "كلمة المرور *"}
            </Label>
            <Input
              id="u-pw"
              type="password"
              autoComplete="new-password"
              value={values.password}
              onChange={(e) =>
                setValues((v) => ({ ...v, password: e.target.value }))
              }
              placeholder={isEdit ? "اتركها فارغة للإبقاء" : "٨ أحرف على الأقل"}
              minLength={isEdit ? 0 : 8}
            />
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
