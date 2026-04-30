// hook لإدارة بيانات الأعمال العلمية عبر API
// — initial load: loading
// — mutations: optimistic + rollback عند الفشل + toast للخطأ
"use client";

import { useCallback, useEffect, useState } from "react";
import type { ScientificWork } from "@/types/works";
import type { WorkFormValues } from "./WorkDialog";

export interface ToastMessage {
  id: number;
  type: "success" | "error";
  text: string;
}

export interface UseWorks {
  works: ScientificWork[];
  loading: boolean;
  error: string | null;
  toast: ToastMessage | null;
  dismissToast: () => void;
  refetch: () => Promise<void>;
  create: (values: WorkFormValues) => Promise<boolean>;
  update: (id: string, values: WorkFormValues) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  advance: (id: string) => Promise<boolean>;
}

async function readJson(res: Response): Promise<{ ok: boolean; error?: string; work?: ScientificWork }> {
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
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((type: ToastMessage["type"], text: string) => {
    setToast({ id: Date.now(), type, text });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  // إخفاء التوست تلقائياً بعد 4 ثواني
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

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
        showToast("success", `تمّت إضافة "${json.work.title}"`);
        return true;
      } catch (e) {
        showToast(
          "error",
          e instanceof Error ? e.message : "خطأ غير متوقع"
        );
        return false;
      }
    },
    [showToast]
  );

  const update = useCallback(
    async (id: string, values: WorkFormValues): Promise<boolean> => {
      const previous = works;
      // تحديث متفائل
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
        showToast("success", "تمّ حفظ التغييرات");
        return true;
      } catch (e) {
        // rollback
        setWorks(previous);
        showToast(
          "error",
          e instanceof Error ? e.message : "خطأ غير متوقع"
        );
        return false;
      }
    },
    [works, showToast]
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      const previous = works;
      const target = previous.find((w) => w.id === id);
      // تحديث متفائل
      setWorks((all) => all.filter((w) => w.id !== id));
      try {
        const res = await fetch(`/api/works/${id}`, { method: "DELETE" });
        const json = await readJson(res);
        if (!res.ok || !json.ok) {
          throw new Error(json.error || "فشل الحذف");
        }
        showToast("success", `تمّ حذف "${target?.title ?? "العمل"}"`);
        return true;
      } catch (e) {
        setWorks(previous);
        showToast(
          "error",
          e instanceof Error ? e.message : "خطأ غير متوقع"
        );
        return false;
      }
    },
    [works, showToast]
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
        showToast("success", "تمّ نقل المرحلة");
        return true;
      } catch (e) {
        showToast(
          "error",
          e instanceof Error ? e.message : "خطأ غير متوقع"
        );
        return false;
      }
    },
    [showToast]
  );

  return {
    works,
    loading,
    error,
    toast,
    dismissToast,
    refetch: fetchAll,
    create,
    update,
    remove,
    advance,
  };
}
