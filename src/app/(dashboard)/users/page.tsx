"use client";

// صفحة إدارة المستخدمين — متاحة لـADMIN فقط (محمية بـmiddleware + API)
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toast } from "@/components/works/Toast";
import { UserDialog, type UserRow, type UserFormValues } from "@/components/users/UserDialog";
import { ROLE_LABEL, ROLE_TONE } from "@/lib/rbac";
import { formatDate } from "@/lib/utils";

interface ToastState {
  id: number;
  type: "success" | "error";
  text: string;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const me = session?.user;

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.ok)
        throw new Error(json.error || "فشل تحميل المستخدمين");
      setUsers((json.users ?? []) as UserRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(u: UserRow) {
    setEditing(u);
    setDialogOpen(true);
  }

  async function handleSubmit(values: UserFormValues) {
    setSubmitting(true);
    try {
      const url = editing ? `/api/users/${editing.id}` : "/api/users";
      const method = editing ? "PUT" : "POST";
      // عند التعديل لا نرسل password إن كان فارغاً
      const body =
        editing && values.password.length === 0
          ? { name: values.name, email: values.email, role: values.role }
          : values;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.ok)
        throw new Error(json.error || "فشلت العملية");

      const u = json.user as UserRow;
      if (editing) {
        setUsers((all) => all.map((x) => (x.id === u.id ? u : x)));
        showToast("success", "تمّ حفظ التغييرات");
      } else {
        setUsers((all) => [u, ...all]);
        showToast("success", `تمّت إضافة "${u.name ?? u.email}"`);
      }
      setDialogOpen(false);
    } catch (e) {
      showToast("error", e instanceof Error ? e.message : "خطأ غير متوقع");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(u: UserRow) {
    if (!confirm(`هل تريد حذف الحساب "${u.name ?? u.email}"؟`)) return;
    const previous = users;
    setUsers((all) => all.filter((x) => x.id !== u.id));
    try {
      const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "فشل الحذف");
      showToast("success", "تمّ الحذف");
    } catch (e) {
      setUsers(previous);
      showToast("error", e instanceof Error ? e.message : "خطأ");
    }
  }

  // ————— حالة الخطأ المحظورة —————
  if (error && users.length === 0) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-red-600 mx-auto" />
        <div>
          <h2 className="text-lg font-extrabold text-red-800 mb-1">
            تعذّر تحميل المستخدمين
          </h2>
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <Button variant="primary" onClick={() => void refetch()}>
          <RefreshCw className="h-4 w-4" />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-saei-purple-700 mb-1 flex items-center gap-2">
            <ShieldCheck className="h-7 w-7" />
            إدارة المستخدمين
          </h1>
          <p className="text-stone-600 text-sm">
            إنشاء حسابات النظام وتعديل أدوارها
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void refetch()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
          <Button variant="primary" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            مستخدم جديد
          </Button>
        </div>
      </div>

      {error && users.length > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <Button variant="ghost" size="sm" onClick={() => void refetch()}>
            إعادة المحاولة
          </Button>
        </div>
      )}

      {loading && users.length === 0 ? (
        <Card>
          <CardHeader className="text-center py-12">
            <CardTitle className="text-saei-purple-300 animate-pulse">
              جاري التحميل…
            </CardTitle>
          </CardHeader>
        </Card>
      ) : users.length === 0 ? (
        <Card>
          <CardHeader className="text-center py-12">
            <CardTitle>لا يوجد مستخدمون</CardTitle>
            <CardDescription>أضف أول مستخدم بالضغط على الزر أعلاه</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="rounded-2xl border border-saei-purple-100 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead className="w-32">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const isMe = me?.id === u.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-bold text-saei-purple-700">
                        {u.name ?? "—"}
                        {isMe && (
                          <Badge variant="gold" className="me-2">
                            أنت
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="ltr text-left text-sm text-stone-700">
                        {u.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ROLE_TONE[u.role]}>
                        {ROLE_LABEL[u.role]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-stone-600 whitespace-nowrap">
                      {formatDate(u.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(u)}
                          aria-label="تعديل"
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4 text-saei-purple-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => void handleDelete(u)}
                          aria-label="حذف"
                          disabled={isMe}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <UserDialog
        open={dialogOpen}
        initial={editing}
        submitting={submitting}
        onOpenChange={(v) => !submitting && setDialogOpen(v)}
        onSubmit={handleSubmit}
      />

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
