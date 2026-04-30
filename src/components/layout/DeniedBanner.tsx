"use client";

// شريط تنبيه يظهر عند تحويل المستخدم بسبب نقص صلاحية
import { useSearchParams } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export function DeniedBanner() {
  const params = useSearchParams();
  const denied = params.get("denied");
  if (!denied) return null;

  return (
    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex items-center gap-2">
      <ShieldAlert className="h-4 w-4 shrink-0" />
      <span>
        لا تملك صلاحية الوصول إلى{" "}
        <span className="ltr inline-block font-mono bg-white/60 px-1.5 py-0.5 rounded">
          {denied}
        </span>
        . تواصل مع مدير النظام إن كنت بحاجة إلى وصول إضافي.
      </span>
    </div>
  );
}
