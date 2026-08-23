import Link from "next/link";
import { ReportType } from "@prisma/client";

import { getActiveReports } from "@/lib/reports/queries";
import { requireUser } from "@/lib/session";
import { ReportListItem } from "@/components/reports/report-list-item";
import { ReportFilters } from "@/components/reports/report-filters";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function parseType(value: string | undefined): ReportType | undefined {
  return value === ReportType.LOST || value === ReportType.FOUND ? value : undefined;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string; page?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const type = parseType(sp.type);
  const query = sp.q;
  const page = Number(sp.page) || 1;

  const { items, page: currentPage, totalPages, total } = await getActiveReports({
    type,
    query,
    page,
  });

  const preservedParams = new URLSearchParams();
  if (type) preservedParams.set("type", type);
  if (query) preservedParams.set("q", query);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse everything currently reported lost or found on campus.
          </p>
        </div>
        <Link href="/reports/new" className={cn(buttonVariants({ size: "sm" }))}>
          New report
        </Link>
      </div>

      <ReportFilters basePath="/reports" type={type} query={query} />

      <p className="text-sm text-muted-foreground">
        {total} active {total === 1 ? "report" : "reports"}
      </p>

      <ul className="flex flex-col gap-3">
        {items.map((report) => (
          <ReportListItem key={report.id} report={report} />
        ))}
        {items.length === 0 && (
          <li className="rounded-lg border border-dashed border-border p-10 text-center">
            <p className="text-sm font-medium text-foreground">No reports match your filters</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search term, or check back later as new reports come in.
            </p>
          </li>
        )}
      </ul>

      <PaginationControls
        basePath="/reports"
        params={preservedParams}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
}
