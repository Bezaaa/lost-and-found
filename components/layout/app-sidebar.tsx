import Link from "next/link";
import { LogOut, Plus, Search } from "lucide-react";

import { logoutAction } from "@/lib/actions/auth-actions";
import { NavLinks } from "@/components/layout/nav-links";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppSidebar({
  user,
}: {
  user: { name?: string | null; email?: string | null };
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Search className="size-4" />
        </span>
        <Link href="/" className="text-base font-semibold tracking-tight text-foreground">
          Lost &amp; Found
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-3">
        {/* Intercepted as a modal when navigated to from inside the app;
            /reports/new still renders as a full page on a direct visit. */}
        <Link href="/reports/new" className={cn(buttonVariants({ size: "sm" }), "w-full")}>
          <Plus className="size-4" />
          New Report
        </Link>
        <NavLinks />
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
    </aside>
  );
}
