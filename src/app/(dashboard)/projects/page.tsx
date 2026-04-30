"use client";

// صفحة إدارة الأعمال العلمية — جدول متقدم + فلاتر + بحث + pagination
// + إضافة/تعديل/حذف/نقل المرحلة + بطاقات إحصاء + تصميم RTL responsive
import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
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
import { SAMPLE_WORKS } from "@/lib/works-data";
import {
  isOverdue,
  nextStage,
  type ScientificWork,
} from "@/types/works";
import { toArabicDigits } from "@/lib/utils";

const PAGE_SIZE = 8;

export default function ProjectsPage() {
  // ————— مصدر البيانات (in-memory حتى ربط DB) —————
  const [works, setWorks] = useState<ScientificWork[]>(SAMPLE_WORKS);

  // ————— حالة الفلاتر والبحث والصفحة —————
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FiltersState>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  // ————— حالات النوافذ —————
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ScientificWork | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<ScientificWork | null>(null);

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

  // ————— Pagination حسابات —————
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  // عند تغيير الفلاتر/البحث، نرجع للصفحة 1
  function handleFiltersChange(f: FiltersState) {
    setFilters(f);
    setPage(1);
  }
  function handleSearchChange(v: string) {
    setSearch(v);
    setPage(1);
  }

  // ————— إحصاءات سريعة على البيانات الكاملة —————
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

  function handleAdvance(w: ScientificWork) {
    const next = nextStage(w.stage);
    if (!next) return;
    setWorks((all) =>
      all.map((x) =>
        x.id === w.id
          ? {
              ...x,
              stage: next,
              progress: next === "PUBLISHED" ? 100 : x.progress,
              updatedAt: new Date().toISOString(),
            }
          : x
      )
    );
  }

  function handleDelete(w: ScientificWork) {
    if (!confirm(`هل تريد حذف العمل "${w.title}"؟`)) return;
    setWorks((all) => all.filter((x) => x.id !== w.id));
  }

  function handleSubmit(values: WorkFormValues) {
    if (editing) {
      setWorks((all) =>
        all.map((x) => (x.id === editing.id ? { ...x, ...values } : x))
      );
    } else {
      const nextNumber = works.length + 1;
      const code =
        values.code.trim() ||
        `SAEI-2024-${String(nextNumber).padStart(3, "0")}`;
      const id = `w-${Date.now().toString(36)}`;
      setWorks((all) => [{ id, ...values, code }, ...all]);
    }
    setFormOpen(false);
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
        <Button variant="primary" size="md" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          إضافة عمل علمي جديد
        </Button>
      </div>

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
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
      />
      <WorkViewDialog
        open={viewOpen}
        work={viewing}
        onOpenChange={setViewOpen}
      />
    </div>
  );
}
