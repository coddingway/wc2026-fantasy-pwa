"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, RefreshCw, BarChart2, Zap, MoreHorizontal } from "lucide-react";

const nav = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/squad", icon: Users, label: "Squad" },
  { href: "/transfers", icon: RefreshCw, label: "Transfers" },
  { href: "/analytics", icon: BarChart2, label: "Stats" },
  { href: "/live", icon: Zap, label: "Live" },
  { href: "/more", icon: MoreHorizontal, label: "More" },
];

export default function BottomNav() {
  const path = usePathname();
  if (path === "/login") return null; // no navbar on the signup/login screen
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur border-t border-slate-800 h-20 flex items-center">
      {nav.map(({ href, icon: Icon, label }) => {
        const active = path === href;
        return (
          <Link key={href} href={href} className="flex-1 flex flex-col items-center gap-1 py-2 transition-all">
            <Icon size={20} className={active ? "text-emerald-400" : "text-slate-500"} />
            <span className={`text-[10px] font-medium ${active ? "text-emerald-400" : "text-slate-500"}`}>{label}</span>
            {active && <span className="w-1 h-1 rounded-full bg-emerald-400" />}
          </Link>
        );
      })}
    </nav>
  );
}
