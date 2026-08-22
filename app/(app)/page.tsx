import Link from "next/link";
import { ClipboardList, FolderOpen, GitCompareArrows } from "lucide-react";

import { requireUser } from "@/lib/session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const QUICK_LINKS = [
  {
    href: "/reports",
    icon: ClipboardList,
    title: "Browse reports",
    description: "Search all active lost and found reports on campus.",
  },
  {
    href: "/my-reports",
    icon: FolderOpen,
    title: "My reports",
    description: "View and manage the reports you've submitted.",
  },
  {
    href: "/matches",
    icon: GitCompareArrows,
    title: "Potential matches",
    description: "See ranked matches between your active reports and others.",
  },
];

export default async function Home() {
  const user = await requireUser();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome back, {user.name ?? user.email}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          What would you like to do today?
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {QUICK_LINKS.map(({ href, icon: Icon, title, description }) => (
          <Link key={href} href={href}>
            <Card className="h-full transition-colors hover:border-primary/40 hover:bg-accent/40">
              <CardHeader>
                <Icon className="size-5 text-primary" />
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
