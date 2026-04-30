"use client";

// شريط علوي في لوحة التحكم
import { Bell, Search, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="h-16 border-b border-saei-purple-100 bg-white flex items-center px-6 gap-4">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="search"
            placeholder="ابحث في المشاريع، الباحثين، التقارير..."
            className="w-full h-10 pe-10 ps-4 rounded-xl border border-saei-purple-100 bg-saei-purple-50/30 focus:outline-none focus:border-saei-purple focus:ring-2 focus:ring-saei-purple/20 text-sm"
          />
        </div>
      </div>

      <Button variant="ghost" size="icon" aria-label="الإشعارات">
        <Bell className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-2">
        <UserCircle2 className="h-9 w-9 text-saei-purple-400" />
        <div className="text-sm">
          <div className="font-bold text-saei-purple-700">الزائر</div>
          <div className="text-xs text-stone-500">غير مسجّل</div>
        </div>
      </div>
    </header>
  );
}
