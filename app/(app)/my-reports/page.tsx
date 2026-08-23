import Link from "next/link";
import { ReportStatus, ReportType } from "@prisma/client";

import { getUserReports } from "@/lib/reports/queries";
import { getMatchSummaryForReports } from "@/lib/matching/service";
import { requireUser } from "@/lib/session";
import { MyReportListItem } from "@/components/reports/my-report-list-item";
import { ReportFilters } from "@/components/reports/report-filters";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function parseType(value: string | undefined): ReportType | undefined {
  return value === ReportType.LOST || value === ReportType.FOUND ? value : undefined;
}

function parseStatus(value: string | undefined): ReportStatus | undefined {
  return value === ReportStatus.ACTIVE || value === ReportStatus.RESOLVED ? value : undefined;
}

export default async function MyReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; page?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const type = parseType(sp.type);
  const status = parseStatus(sp.status);
  const page = Number(sp.page) || 1;

  const { items, page: currentPage, totalPages, total } = await getUserReports(user.id, {
    type,
    status,
    page,
  });

  const matchSummaries = await getMatchSummaryForReports(items.map((report) => report.id));

  const preservedParams = new URLSearchParams();
  if (type) preservedParams.set("type", type);
  if (status) preservedParams.set("status", status);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">My reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything you&apos;ve reported, active or resolved.
          </p>
        </div>
        <Link href="/reports/new" className={cn(buttonVariants({ size: "sm" }))}>
          New report
        </Link>
      </div>

      <ReportFilters basePath="/my-reports" type={type} status={status} showStatusFilter />

      <p className="text-sm text-muted-foreground">
        {total} {total === 1 ? "report" : "reports"}
      </p>

      <ul className="flex flex-col gap-3">
        {items.map((report) => (
          <MyReportListItem key={report.id} report={report} matchSummary={matchSummaries.get(report.id)} />
        ))}
        {items.length === 0 && (
          <li className="rounded-lg border border-dashed border-border p-10 text-center">
            <p className="text-sm font-medium text-foreground">No reports match your filters</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {status || type
                ? "Try a different filter, or create a new report."
                : "You haven't reported anything yet."}
            </p>
            <Link href="/reports/new" className={cn(buttonVariants({ size: "sm" }), "mt-4")}>
              Create your first report
            </Link>
          </li>
        )}
      </ul>

      <PaginationControls
        basePath="/my-reports"
        params={preservedParams}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
}
