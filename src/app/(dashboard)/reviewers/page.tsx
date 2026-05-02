"use client";

// صفحة إدارة المحكمين — للمنسقين والمدير
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  AlertTriangle,
  UserCheck,
  Mail,
  GraduationCap,
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
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/alert-dialog";
import {
  SortableHeader,
  toggleSort,
  type SortState,
} from "@/components/ui/sortable-header";
import { useToast } from "@/components/ui/toast";
import {
  ReviewerDialog,
  type ReviewerFormValues,
} from "@/components/reviewers/ReviewerDialog";
import { SPECIALTY_LABEL, type WorkSpecialty } from "@/types/works";
import type { ReviewerDto } from "@/types/reviews";
import { cn, formatDate, toArabicDigits } from "@/lib/utils";

type SortKey = "name" | "responseRate" | "totalAssigned" | "createdAt";

export default function ReviewersPage() {
  const toast = useToast();

  const [reviewers, setReviewers] = useState<ReviewerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sort, setSort] = useState<SortState<SortKey> | null>({
    key: "responseRate",
    direction: "desc",
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ReviewerDto | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ReviewerDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reviewers", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json.ok)
        throw new Error(json.error || "فشل تحميل المحكمين");
      setReviewers((json.reviewers ?? []) as ReviewerDto[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const sorted = useMemo(() => {
    if (!sort) return reviewers;
    const f = sort.direction === "asc" ? 1 : -1;
    const arr = [...reviewers];
    arr.sort((a, b) => {
      switch (sort.key) {
        case "name":
          return a.name.localeCompare(b.name, "ar") * f;
        case "responseRate":
          return (a.responseRate - b.responseRate) * f;
        case "totalAssigned":
          return (a.totalAssigned - b.totalAssigned) * f;
        case "createdAt":
          return a.createdAt.localeCompare(b.createdAt) * f;
      }
    });
    return arr;
  }, [reviewers, sort]);

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(r: ReviewerDto) {
    setEditing(r);
    setDialogOpen(true);
  }

  async function handleSubmit(values: ReviewerFormValues) {
    setSubmitting(true);
    try {
      if (editing) {
        // تعديل: لا نرسل email/password
        const res = await fetch(`/api/reviewers/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: values.name,
            expertise: values.expertise,
            specialties: values.specialties,
            active: values.active,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.ok)
          throw new Error(json.error || "فشل التحديث");
        const r = json.reviewer as ReviewerDto;
        setReviewers((all) => all.map((x) => (x.id === r.id ? r : x)));
        toast.success("تمّ حفظ التغييرات");
      } else {
        const res = await fetch("/api/reviewers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const json = await res.json();
        if (!res.ok || !json.ok)
          throw new Error(json.error || "فشل الإنشاء");
        const r = json.reviewer as ReviewerDto;
        setReviewers((all) => [r, ...all]);
        toast.success("تمّت إضافة المحكم", { description: r.name });
      }
      setDialogOpen(false);
    } catch (e) {
      toast.error("فشلت العملية", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  function requestDelete(r: ReviewerDto) {
    setDeleteTarget(r);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/reviewers/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "فشل الحذف");
      setReviewers((all) => all.filter((x) => x.id !== deleteTarget.id));
      toast.success("تمّ حذف المحكم", { description: deleteTarget.name });
      setDeleteTarget(null);
    } catch (e) {
      toast.error("تعذّر الحذف", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setDeleting(false);
    }
  }

  if (error && reviewers.length === 0) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="تعذّر تحميل المحكمين"
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
            <UserCheck className="h-7 w-7" />
            هيئة المحكمين
          </h1>
          <p className="text-stone-600 text-sm">
            إدارة المحكمين وتخصصاتهم ومتابعة معدلات استجابتهم
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
            محكم جديد
          </Button>
        </div>
      </div>

      {loading && reviewers.length === 0 ? (
        <ReviewersSkeleton />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="لا يوجد محكمون بعد"
          description="ابدأ ببناء هيئة المراجعة العلمية للمؤسسة."
          action={
            <Button variant="primary" onClick={openAdd}>
              <Plus className="h-4 w-4" />
              محكم جديد
            </Button>
          }
          variant="subtle"
        />
      ) : (
        <>
          {/* جدول للكمبيوتر */}
          <div className="hidden md:block rounded-2xl border border-saei-purple-100 bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortableHeader<SortKey>
                      label="المحكم"
                      sortKey="name"
                      current={sort}
                      onSort={(k) => setSort((p) => toggleSort(p, k))}
                    />
                  </TableHead>
                  <TableHead>التخصصات</TableHead>
                  <TableHead>
                    <SortableHeader<SortKey>
                      label="معدل الاستجابة"
                      sortKey="responseRate"
                      current={sort}
                      onSort={(k) => setSort((p) => toggleSort(p, k, "desc"))}
                    />
                  </TableHead>
                  <TableHead>
                    <SortableHeader<SortKey>
                      label="إجمالي التكليفات"
                      sortKey="totalAssigned"
                      current={sort}
                      onSort={(k) => setSort((p) => toggleSort(p, k, "desc"))}
                    />
                  </TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="w-32">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((r) => (
                  <ReviewerRow
                    key={r.id}
                    r={r}
                    onEdit={() => openEdit(r)}
                    onDelete={() => requestDelete(r)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {/* بطاقات للجوال */}
          <div className="md:hidden space-y-3">
            {sorted.map((r) => (
              <ReviewerCard
                key={r.id}
                r={r}
                onEdit={() => openEdit(r)}
                onDelete={() => requestDelete(r)}
              />
            ))}
          </div>
        </>
      )}

      <ReviewerDialog
        open={dialogOpen}
        initial={editing}
        submitting={submitting}
        onOpenChange={(v) => !submitting && setDialogOpen(v)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        variant="danger"
        title="حذف محكم"
        description={
          deleteTarget && (
            <>
              هل أنت متأكد من حذف المحكم{" "}
              <strong className="text-saei-purple-700">
                «{deleteTarget.name}»
              </strong>
              ؟ سيُحذف حسابه نهائياً.
            </>
          )
        }
        confirmLabel="حذف نهائي"
        loading={deleting}
        onOpenChange={(v) => !deleting && !v && setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function ReviewerRow({
  r,
  onEdit,
  onDelete,
}: {
  r: ReviewerDto;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <TableRow>
      <TableCell>
        <div className="font-bold text-saei-purple-700">{r.name}</div>
        <div className="ltr text-left text-xs text-stone-500 mt-0.5">
          {r.email}
        </div>
        {r.expertise && (
          <div className="text-xs text-stone-600 mt-1">{r.expertise}</div>
        )}
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1 max-w-xs">
          {r.specialties.map((s) => (
            <Badge key={s} variant="purple">
              {SPECIALTY_LABEL[s as WorkSpecialty] ?? s}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <ResponseRate rate={r.responseRate} totalAssigned={r.totalAssigned} />
      </TableCell>
      <TableCell>
        <div className="text-sm tabular-nums">
          <span className="font-bold text-saei-purple-700">
            {toArabicDigits(r.totalCompleted)}
          </span>
          <span className="text-stone-400"> / </span>
          <span className="text-stone-600">
            {toArabicDigits(r.totalAssigned)}
          </span>
        </div>
      </TableCell>
      <TableCell>
        {r.active ? (
          <Badge variant="green">نشط</Badge>
        ) : (
          <Badge variant="gray">غير نشط</Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onEdit}
            aria-label="تعديل"
          >
            <Pencil className="h-4 w-4 text-saei-purple-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onDelete}
            aria-label="حذف"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function ReviewerCard({
  r,
  onEdit,
  onDelete,
}: {
  r: ReviewerDto;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl border border-saei-purple-100 bg-white p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-2xl bg-saei-purple-100 grid place-items-center text-saei-purple-700 shrink-0">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-saei-purple-700 truncate">
              {r.name}
            </span>
            {!r.active && <Badge variant="gray">غير نشط</Badge>}
          </div>
          <div className="ltr text-left text-xs text-stone-500 mt-0.5 flex items-center gap-1">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{r.email}</span>
          </div>
        </div>
      </div>
      {r.expertise && (
        <p className="text-xs text-stone-600 leading-relaxed">{r.expertise}</p>
      )}
      <div className="flex flex-wrap gap-1">
        {r.specialties.map((s) => (
          <Badge key={s} variant="purple">
            {SPECIALTY_LABEL[s as WorkSpecialty] ?? s}
          </Badge>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs pt-2 border-t border-saei-purple-100">
        <ResponseRate rate={r.responseRate} totalAssigned={r.totalAssigned} />
        <span className="text-stone-500 tabular-nums">
          {toArabicDigits(r.totalCompleted)} / {toArabicDigits(r.totalAssigned)}
        </span>
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-saei-purple-100">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onEdit}
        >
          <Pencil className="h-3.5 w-3.5" />
          تعديل
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="flex-1 text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          حذف
        </Button>
      </div>
    </div>
  );
}

function ResponseRate({
  rate,
  totalAssigned,
}: {
  rate: number;
  totalAssigned: number;
}) {
  if (totalAssigned === 0) {
    return <span className="text-xs text-stone-500">—</span>;
  }
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-2 rounded-full bg-saei-purple-50 overflow-hidden">
        <div
          className={cn(
            "h-full transition-all",
            rate >= 80
              ? "bg-emerald-500"
              : rate >= 50
                ? "bg-saei-gold"
                : "bg-red-500"
          )}
          style={{ width: `${rate}%` }}
        />
      </div>
      <span className="text-xs font-bold tabular-nums w-10 text-left text-saei-purple-700">
        {toArabicDigits(rate)}٪
      </span>
    </div>
  );
}

function ReviewersSkeleton() {
  return (
    <div className="rounded-2xl border border-saei-purple-100 bg-white overflow-hidden">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-20 border-b border-saei-purple-100/50 px-4 flex items-center gap-4 last:border-0"
        >
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-2 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}
