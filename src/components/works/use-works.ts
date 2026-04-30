// hook لإدارة بيانات الأعمال العلمية عبر API
// — initial load: loading
// — mutations: optimistic + rollback عند الفشل + toast من النظام العام
"use client";

import { useCallback, useEffect, useState } from "react";
import type { ScientificWork } from "@/types/works";
import type { WorkFormValues } from "./WorkDialog";
import { useToast } from "@/components/ui/toast";

export interface UseWorks {
  works: ScientificWork[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (values: WorkFormValues) => Promise<boolean>;
  update: (id: string, values: WorkFormValues) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  advance: (id: string) => Promise<boolean>;
}

async function readJson(
  res: Response
): Promise<{ ok: boolean; error?: string; work?: ScientificWork }> {
  try {
    return await res.json();
  } catch {
    return { ok: false, error: "استجابة غير صالحة من الخادم" };
  }
}

export function useWorks(): UseWorks {
  const [works, setWorks] = useState<ScientificWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/works", { cache: "no-store" });
      const json = await readJson(res);
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "فشل تحميل البيانات");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setWorks(((json as any).works ?? []) as ScientificWork[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const create = useCallback(
    async (values: WorkFormValues): Promise<boolean> => {
      try {
        const res = await fetch("/api/works", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const json = await readJson(res);
        if (!res.ok || !json.ok || !json.work) {
          throw new Error(json.error || "فشل إنشاء العمل");
        }
        setWorks((all) => [json.work as ScientificWork, ...all]);
        toast.success("تمّت إضافة العمل العلمي", {
          description: json.work.title,
        });
        return true;
      } catch (e) {
        toast.error("تعذّر إنشاء العمل", {
          description: e instanceof Error ? e.message : undefined,
        });
        return false;
      }
    },
    [toast]
  );

  const update = useCallback(
    async (id: string, values: WorkFormValues): Promise<boolean> => {
      const previous = works;
      setWorks((all) =>
        all.map((w) =>
          w.id === id
            ? {
                ...w,
                ...values,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                stage: values.stage as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                track: values.track as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                specialty: values.specialty as any,
              }
            : w
        )
      );
      try {
        const res = await fetch(`/api/works/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const json = await readJson(res);
        if (!res.ok || !json.ok || !json.work) {
          throw new Error(json.error || "فشل التحديث");
        }
        setWorks((all) =>
          all.map((w) => (w.id === id ? (json.work as ScientificWork) : w))
        );
        toast.success("تمّ حفظ التغييرات");
        return true;
      } catch (e) {
        setWorks(previous);
        toast.error("تعذّر تحديث العمل", {
          description: e instanceof Error ? e.message : undefined,
        });
        return false;
      }
    },
    [works, toast]
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      const previous = works;
      const target = previous.find((w) => w.id === id);
      setWorks((all) => all.filter((w) => w.id !== id));
      try {
        const res = await fetch(`/api/works/${id}`, { method: "DELETE" });
        const json = await readJson(res);
        if (!res.ok || !json.ok) {
          throw new Error(json.error || "فشل الحذف");
        }
        toast.success("تمّ الحذف", {
          description: target?.title,
        });
        return true;
      } catch (e) {
        setWorks(previous);
        toast.error("تعذّر الحذف", {
          description: e instanceof Error ? e.message : undefined,
        });
        return false;
      }
    },
    [works, toast]
  );

  const advance = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/works/${id}/advance`, {
          method: "POST",
        });
        const json = await readJson(res);
        if (!res.ok || !json.ok || !json.work) {
          throw new Error(json.error || "فشل نقل المرحلة");
        }
        setWorks((all) =>
          all.map((w) => (w.id === id ? (json.work as ScientificWork) : w))
        );
        toast.success("تمّ نقل المرحلة");
        return true;
      } catch (e) {
        toast.error("تعذّر نقل المرحلة", {
          description: e instanceof Error ? e.message : undefined,
        });
        return false;
      }
    },
    [toast]
  );

  return {
    works,
    loading,
    error,
    refetch: fetchAll,
    create,
    update,
    remove,
    advance,
  };
}
