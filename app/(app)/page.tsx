import Link from "next/link";
import { GitCompareArrows, PackageSearch, PackageX } from "lucide-react";
import type { SignalReason } from "@/lib/matching/types";

import { getDashboardData } from "@/lib/dashboard/queries";
import { requireUser } from "@/lib/session";
import { StatTile } from "@/components/dashboard/stat-tile";
import { LostFoundBar } from "@/components/dashboard/lost-found-bar";
import { ReportListItem } from "@/components/reports/report-list-item";
import { MatchCard } from "@/components/matches/match-card";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome back, {user.name ?? user.email}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening across campus right now.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Active lost items"
          value={data.activeLostCount}
          icon={PackageX}
          accentClassName="bg-rose-500/15 text-rose-300"
        />
        <StatTile
          label="Active found items"
          value={data.activeFoundCount}
          icon={PackageSearch}
          accentClassName="bg-green-500/15 text-green-300"
        />
        <StatTile
          label="Your potential matches"
          value={data.potentialMatchesCount}
          icon={GitCompareArrows}
          accentClassName="bg-accent text-accent-foreground"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lost vs. found, campus-wide</CardTitle>
        </CardHeader>
        <CardContent>
          <LostFoundBar lostCount={data.activeLostCount} foundCount={data.activeFoundCount} />
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Strongest potential matches</h2>
          <Link href="/matches" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>

        {data.strongestMatches.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm font-medium text-foreground">No potential matches yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a report and we&apos;ll start looking for matches automatically.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {data.strongestMatches.map((match) => (
              <MatchCard
                key={match.id}
                id={match.id}
                score={match.score}
                reasons={match.reasons as unknown as SignalReason[]}
                lostReport={match.lostReport}
                foundReport={match.foundReport}
              />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent reports</h2>
          <Link href="/reports" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>

        {data.recentReports.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm font-medium text-foreground">No active reports yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Be the first to report a lost or found item.</p>
            <Link href="/reports/new" className={cn(buttonVariants({ size: "sm" }), "mt-4")}>
              Create a report
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {data.recentReports.map((report) => (
              <ReportListItem key={report.id} report={report} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
