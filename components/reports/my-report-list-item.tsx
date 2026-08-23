import Link from "next/link";
import { CalendarDays, GitCompareArrows, MapPin } from "lucide-react";
import type { Report } from "@prisma/client";

import { CATEGORY_LABELS } from "@/lib/reports/labels";
import type { MatchSummary } from "@/lib/matching/service";
import { resolveReportAction } from "@/lib/actions/report-actions";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReportTypeBadge } from "@/components/reports/report-type-badge";
import { ReportImageThumb } from "@/components/reports/report-image-thumb";
import { cn } from "@/lib/utils";

export function MyReportListItem({
  report,
  matchSummary,
}: {
  report: Report;
  matchSummary?: MatchSummary;
}) {
  const boundResolve = resolveReportAction.bind(null, report.id);

  return (
    <li>
      <Card className="flex flex-col gap-4 p-4 sm:flex-row">
        <Link href={`/reports/${report.id}`} className="flex min-w-0 flex-1 cursor-pointer gap-4">
          <ReportImageThumb
            imageUrl={report.imageUrl}
            itemName={report.itemName}
            category={report.category}
          />

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <ReportTypeBadge type={report.type} />
              {report.status === "RESOLVED" ? (
                <Badge variant="resolved">Resolved</Badge>
              ) : (
                <Badge variant="outline" className="text-stone-400">
                  Active
                </Badge>
              )}
              <span className="truncate font-semibold text-foreground">{report.itemName}</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
                {CATEGORY_LABELS[report.category]}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {report.location}
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3.5" />
                {report.date.toISOString().slice(0, 10)}
              </span>
            </div>

            {matchSummary && matchSummary.count > 0 && (
              <span className="flex w-fit items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                <GitCompareArrows className="size-3.5" />
                {matchSummary.count} potential {matchSummary.count === 1 ? "match" : "matches"} · best{" "}
                {matchSummary.bestScore}/100
              </span>
            )}
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-stretch">
          {report.status === "ACTIVE" && (
            <>
              <Link
                href={`/reports/${report.id}/edit`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Edit
              </Link>
              <form action={boundResolve}>
                <Button type="submit" variant="secondary" size="sm" className="w-full">
                  Resolve
                </Button>
              </form>
            </>
          )}
        </div>
      </Card>
    </li>
  );
}
