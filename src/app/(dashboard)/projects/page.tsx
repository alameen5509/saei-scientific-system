"use client";

// صفحة إدارة الأعمال العلمية — مرتبطة بـAPI/قاعدة البيانات الحقيقية
// — useWorks() يدير الجلب والمتفائل والـtoast
// — التصفية والبحث والـpagination تبقى client-side على البيانات المحمَّلة
import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  WorksFilters,
  EMPTY_FILTERS,
  type FiltersState,
} from "@/components/works/WorksFilters";
import { WorksTable } from "@/components/works/WorksTable";
import { Pagination } from "@/components/works/Pagination";
import {
  WorkFormDialog,
  WorkViewDialog,
  type WorkFormValues,
} from "@/components/works/WorkDialog";
import { WorksTableSkeleton } from "@/components/works/WorksTableSkeleton";
import { Toast } from "@/components/works/Toast";
import { useWorks } from "@/components/works/use-works";
import { isOverdue, type ScientificWork } from "@/types/works";
import { toArabicDigits } from "@/lib/utils";

const PAGE_SIZE = 8;

export default function ProjectsPage() {
  // ————— البيانات من API —————
  const {
    works,
    loading,
    error,
    toast,
    dismissToast,
    refetch,
    create,
    update,
    remove,
    advance,
  } = useWorks();

  // ————— الفلاتر والبحث والصفحة —————
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FiltersState>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  // ————— حالة النوافذ —————
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ScientificWork | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<ScientificWork | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ————— تطبيق البحث + الفلاتر —————
  const filtered = useMemo(() => {
    const q = search.trim();
    return works.filter((w) => {
      if (q && !`${w.title} ${w.researcher}`.includes(q)) return false;
      if (filters.stage !== "ALL" && w.stage !== filters.stage) return false;
      if (filters.specialty !== "ALL" && w.specialty !== filters.specialty)
        return false;
      if (filters.track !== "ALL" && w.track !== filters.track) return false;
      if (filters.dateFrom && w.deadline < filters.dateFrom) return false;
      if (filters.dateTo && w.deadline > filters.dateTo) return false;
      return true;
    });
  }, [works, search, filters]);

  // ————— Pagination —————
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  function handleFiltersChange(f: FiltersState) {
    setFilters(f);
    setPage(1);
  }
  function handleSearchChange(v: string) {
    setSearch(v);
    setPage(1);
  }

  // ————— الإحصاءات —————
  const stats = useMemo(() => {
    const total = works.length;
    const inProgress = works.filter(
      (w) =>
        w.stage !== "PUBLISHED" &&
        w.stage !== "ARCHIVED" &&
        w.stage !== "PROPOSED"
    ).length;
    const published = works.filter((w) => w.stage === "PUBLISHED").length;
    const overdue = works.filter((w) => isOverdue(w)).length;
    return { total, inProgress, published, overdue };
  }, [works]);

  // ————— Handlers —————
  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleView(w: ScientificWork) {
    setViewing(w);
    setViewOpen(true);
  }

  function handleEdit(w: ScientificWork) {
    setEditing(w);
    setFormOpen(true);
  }

  async function handleAdvance(w: ScientificWork) {
    await advance(w.id);
  }

  async function handleDelete(w: ScientificWork) {
    if (!confirm(`هل تريد حذف العمل "${w.title}"؟`)) return;
    await remove(w.id);
  }

  async function handleSubmit(values: WorkFormValues) {
    setSubmitting(true);
    const ok = editing
      ? await update(editing.id, values)
      : await create(values);
    setSubmitting(false);
    if (ok) setFormOpen(false);
  }

  // ————— حالة الخطأ المُحظِرة (initial load failure) —————
  if (error && works.length === 0) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-red-600 mx-auto" />
        <div>
          <h2 className="text-lg font-extrabold text-red-800 mb-1">
            تعذّر تحميل الأعمال العلمية
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

  // ————— حالة التحميل الأولي —————
  if (loading && works.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-saei-purple-700 mb-1">
            الأعمال العلمية
          </h1>
          <p className="text-stone-600 text-sm">جاري تحميل البيانات…</p>
        </div>
        <WorksTableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ————— Header ————— */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-saei-purple-700 mb-1">
            الأعمال العلمية
          </h1>
          <p className="text-stone-600 text-sm">
            إدارة شاملة لجميع الأعمال العلمية في مؤسسة ساعي
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void refetch()}
            disabled={loading}
            aria-label="تحديث"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            تحديث
          </Button>
          <Button variant="primary" size="md" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            إضافة عمل علمي جديد
          </Button>
        </div>
      </div>

      {/* ————— شريط خطأ غير مُحظِر (الجلب فشل لكن البيانات موجودة) ————— */}
      {error && works.length > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void refetch()}
          >
            إعادة المحاولة
          </Button>
        </div>
      )}

      {/* ————— KPIs ————— */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex-row items-center gap-3 p-4">
            <div className="h-11 w-11 rounded-xl bg-saei-purple/10 text-saei-purple grid place-items-center">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <CardDescription>إجمالي الأعمال</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {toArabicDigits(stats.total)}
              </CardTitle>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center gap-3 p-4">
            <div className="h-11 w-11 rounded-xl bg-amber-100 text-amber-700 grid place-items-center">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <CardDescription>قيد التنفيذ</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {toArabicDigits(stats.inProgress)}
              </CardTitle>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center gap-3 p-4">
            <div className="h-11 w-11 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <CardDescription>منشور</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {toArabicDigits(stats.published)}
              </CardTitle>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center gap-3 p-4">
            <div className="h-11 w-11 rounded-xl bg-red-100 text-red-700 grid place-items-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <CardDescription>متأخر</CardDescription>
              <CardTitle className="text-2xl tabular-nums text-red-700">
                {toArabicDigits(stats.overdue)}
              </CardTitle>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* ————— Filters ————— */}
      <WorksFilters value={filters} onChange={handleFiltersChange} />

      {/* ————— Search ————— */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <Input
            type="search"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="ابحث في العنوان أو اسم الباحث..."
            className="pe-10"
          />
        </div>
        <span className="text-xs text-stone-500 whitespace-nowrap tabular-nums">
          {toArabicDigits(filtered.length)} نتيجة
        </span>
      </div>

      {/* ————— Table / Cards ————— */}
      <WorksTable
        works={pageItems}
        onView={handleView}
        onEdit={handleEdit}
        onAdvance={handleAdvance}
        onDelete={handleDelete}
      />

      {/* ————— Pagination ————— */}
      <Pagination
        page={safePage}
        pageCount={pageCount}
        total={filtered.length}
        pageSize={PAGE_SIZE}
        onChange={setPage}
      />

      {/* ————— Dialogs ————— */}
      <WorkFormDialog
        open={formOpen}
        initial={editing}
        submitting={submitting}
        onOpenChange={(v) => !submitting && setFormOpen(v)}
        onSubmit={handleSubmit}
      />
      <WorkViewDialog
        open={viewOpen}
        work={viewing}
        onOpenChange={setViewOpen}
      />

      {/* ————— Toast ————— */}
      {toast && (
        <Toast type={toast.type} text={toast.text} onClose={dismissToast} />
      )}
    </div>
  );
}
