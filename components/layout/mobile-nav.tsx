"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, Plus, Search, X } from "lucide-react";

import { logoutAction } from "@/lib/actions/auth-actions";
import { NavLinks } from "@/components/layout/nav-links";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MobileNav({
  user,
}: {
  user: { name?: string | null; email?: string | null };
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever navigation completes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="border-b border-border bg-card md:hidden">
      <div className="flex h-14 items-center gap-2 px-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
        <Link href="/" className="flex items-center gap-2 text-base font-semibold text-foreground">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Search className="size-3.5" />
          </span>
          Lost &amp; Found
        </Link>
      </div>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 cursor-pointer bg-black/60"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card shadow-lg">
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <span className="text-base font-semibold text-foreground">Menu</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" />
              </Button>
            </div>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
              <Link
                href="/reports/new"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants({ size: "sm" }), "w-full")}
              >
                <Plus className="size-4" />
                New Report
              </Link>
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>

            <div className="border-t border-border p-3">
              <div className="flex items-center gap-3 rounded-md px-2 py-2">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                  {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{user.name ?? "Student"}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <form action={logoutAction} className="mt-1">
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-stone-400 hover:bg-stone-800"
                >
                  <LogOut className="size-4" />
                  Log out
                </Button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
