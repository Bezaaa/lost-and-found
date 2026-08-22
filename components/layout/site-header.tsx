import Link from "next/link";
import { ClipboardList, FolderOpen, GitCompareArrows, Plus } from "lucide-react";

import { logoutAction } from "@/lib/actions/auth-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/reports", label: "Reports", icon: ClipboardList },
  { href: "/my-reports", label: "My Reports", icon: FolderOpen },
  { href: "/matches", label: "Potential Matches", icon: GitCompareArrows },
];

export function SiteHeader({
  user,
}: {
  user: { name?: string | null; email?: string | null };
}) {
  return (
    <header className="border-b border-indigo-950 bg-indigo-950">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-6 px-4">
        <Link href="/" className="text-base font-semibold tracking-tight text-white">
          Lost &amp; Found
        </Link>

        <nav className="flex flex-1 items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-indigo-200 transition-colors hover:bg-indigo-900 hover:text-white"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>

        <Link
          href="/reports/new"
          className={cn(buttonVariants({ size: "sm" }), "bg-white text-indigo-950 hover:bg-indigo-100")}
        >
          <Plus className="size-4" />
          New Report
        </Link>

        <div className="flex items-center gap-3 border-l border-indigo-900 pl-4">
          <span className="hidden text-sm text-indigo-200 sm:inline">
            {user.name ?? user.email}
          </span>
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-indigo-200 hover:bg-indigo-900 hover:text-white"
            >
              Log out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
