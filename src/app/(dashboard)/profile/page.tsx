"use client";

// صفحة الملف الشخصي — تعديل الاسم/البريد + تغيير كلمة المرور
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Save, UserCog, KeyRound } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Toast } from "@/components/works/Toast";
import { ROLE_LABEL, ROLE_TONE } from "@/lib/rbac";
import { formatDate } from "@/lib/utils";
import type { UserRole } from "@/types";

interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string;
}

interface ToastState {
  id: number;
  type: "success" | "error";
  text: string;
}

export default function ProfilePage() {
  const { update: updateSession } = useSession();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // قسم البيانات
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);

  // قسم كلمة المرور
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback(
    (type: "success" | "error", text: string) =>
      setToast({ id: Date.now(), type, text }),
    []
  );

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // جلب الملف
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        const json = await res.json();
        if (!alive) return;
        if (!res.ok || !json.ok)
          throw new Error(json.error || "فشل تحميل الملف");
        const p = json.profile as Profile;
        setProfile(p);
        setName(p.name ?? "");
        setEmail(p.email);
      } catch (e) {
        if (alive)
          showToast("error", e instanceof Error ? e.message : "خطأ");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [showToast]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    if (name.trim().length < 2) return setProfileError("الاسم قصير جداً");
    if (!email.includes("@")) return setProfileError("البريد غير صحيح");

    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok)
        throw new Error(json.error || "فشل التحديث");
      const p = json.profile as Profile;
      setProfile(p);
      // تحديث الجلسة فوراً ليُعكس الاسم الجديد في Header
      await updateSession({ name: p.name, email: p.email });
      showToast("success", "تمّ تحديث ملفك الشخصي");
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : "خطأ غير متوقع");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    if (!currentPassword) return setPasswordError("أدخل كلمة المرور الحالية");
    if (newPassword.length < 8)
      return setPasswordError("الكلمة الجديدة يجب ألا تقل عن ٨ أحرف");
    if (newPassword !== confirmPassword)
      return setPasswordError("تأكيد كلمة المرور لا يطابق");

    setSavingPassword(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok)
        throw new Error(json.error || "فشل تغيير كلمة المرور");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("success", "تمّ تغيير كلمة المرور");
    } catch (e) {
      setPasswordError(e instanceof Error ? e.message : "خطأ غير متوقع");
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="text-center py-12">
          <CardTitle className="text-saei-purple-300 animate-pulse">
            جاري التحميل…
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>تعذّر تحميل الملف الشخصي</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* رأس الصفحة + ملخّص */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-saei-purple-700 mb-1 flex items-center gap-2">
          <UserCog className="h-7 w-7" />
          الملف الشخصي
        </h1>
        <p className="text-stone-600 text-sm">
          إدارة بيانات حسابك وكلمة المرور
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-saei-purple text-white grid place-items-center font-extrabold text-2xl shadow-saei-sm">
            {(profile.name ?? profile.email).charAt(0)}
          </div>
          <div className="flex-1">
            <CardTitle>{profile.name ?? "—"}</CardTitle>
            <CardDescription className="ltr text-left">
              {profile.email}
            </CardDescription>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={ROLE_TONE[profile.role]}>
                {ROLE_LABEL[profile.role]}
              </Badge>
              <span className="text-xs text-stone-500">
                عضو منذ {formatDate(profile.createdAt)}
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* بيانات الحساب */}
      <Card>
        <CardHeader>
          <CardTitle>بيانات الحساب</CardTitle>
          <CardDescription>الاسم والبريد الإلكتروني</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="p-name">الاسم الكامل</Label>
                <Input
                  id="p-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-email">البريد الإلكتروني</Label>
                <Input
                  id="p-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="ltr text-left"
                  required
                />
              </div>
            </div>

            {profileError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {profileError}
              </div>
            )}

            <Button type="submit" variant="primary" disabled={savingProfile}>
              <Save className="h-4 w-4" />
              {savingProfile ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* كلمة المرور */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            تغيير كلمة المرور
          </CardTitle>
          <CardDescription>
            أدخل كلمة المرور الحالية للتأكيد، ثم الجديدة مرتين
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="p-cur">كلمة المرور الحالية</Label>
              <Input
                id="p-cur"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="p-new">كلمة المرور الجديدة</Label>
                <Input
                  id="p-new"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-conf">تأكيد كلمة المرور</Label>
                <Input
                  id="p-conf"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
            </div>

            {passwordError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {passwordError}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={savingPassword}
            >
              <KeyRound className="h-4 w-4" />
              {savingPassword ? "جاري التغيير..." : "تغيير كلمة المرور"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {toast && (
        <Toast
          type={toast.type}
          text={toast.text}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
