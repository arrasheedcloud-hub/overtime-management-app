"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, List, BarChart3, Calendar, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/records", label: "السجل", icon: List },
  { href: "/reports", label: "التقارير", icon: BarChart3 },
  { href: "/calendar", label: "التقويم", icon: Calendar },
  { href: "/settings", label: "الإعدادات", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 right-0 left-0 z-40 border-t bg-[rgb(var(--card))] shadow-lg safe-area-pb">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 px-2 py-3 transition-colors",
                isActive
                  ? "text-[rgb(var(--primary))]"
                  : "text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
