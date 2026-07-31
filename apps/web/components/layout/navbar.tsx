"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Clock, LayoutDashboard, History, Settings, Maximize, User, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useTheme } from "next-themes";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Timer", icon: Clock },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    logout();
    router.push("/auth/login");
  }

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Clock className="h-4 w-4" />
          </span>
          Pomodoro
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <span className="h-4 w-4">☀</span> : <span className="h-4 w-4">☾</span>}
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/focus" aria-label="Focus mode">
              <Maximize className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
            <LogOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t bg-background px-4 py-3 md:hidden">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                  pathname === link.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
