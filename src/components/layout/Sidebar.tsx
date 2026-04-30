"use client";

// شريط جانبي للوحة التحكم
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CheckSquare,
  FileBarChart,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";

const items: NavItem[] = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/projects", label: "المشاريع البحثية", icon: FolderKanban },
  { href: "/researchers", label: "الباحثون", icon: Users },
  { href: "/tasks", label: "المهام", icon: CheckSquare },
  { href: "/reports", label: "التقارير", icon: FileBarChart },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-l border-saei-purple-100 bg-white">
      <div className="p-6 border-b border-saei-purple-100">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-saei-purple text-white grid place-items-center font-extrabold shadow-saei-sm">
            س
          </div>
          <div>
            <div className="font-extrabold text-saei-purple-700 leading-tight">
              مؤسسة ساعي
            </div>
            <div className="text-xs text-stone-500">إدارة الأعمال العلمية</div>
          </div>
        </Link>
      </div>

      <nav className="p-3 space-y-1">
        {items.map((it) => {
          const Icon = it.icon;
          const active =
            pathname === it.href || pathname?.startsWith(it.href + "/");
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors",
                active
                  ? "bg-saei-purple text-white shadow-saei-sm"
                  : "text-saei-purple-700 hover:bg-saei-purple-50"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{it.label}</span>
              {it.badge !== undefined && (
                <span className="text-xs bg-saei-gold text-saei-purple-900 px-2 py-0.5 rounded-full">
                  {it.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-saei-purple-100 mt-auto absolute bottom-0 w-64">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-saei-purple-700 hover:bg-saei-purple-50"
        >
          <Settings className="h-5 w-5" />
          <span>الإعدادات</span>
        </Link>
      </div>
    </aside>
  );
}
