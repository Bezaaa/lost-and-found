import Link from "next/link";
import { ReportStatus, ReportType } from "@prisma/client";

import { getUserReports } from "@/lib/reports/queries";
import { requireUser } from "@/lib/session";
import { ReportListItem } from "@/components/reports/report-list-item";
import { Button, buttonVariants } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
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

  const baseParams = new URLSearchParams();
  if (type) baseParams.set("type", type);
  if (status) baseParams.set("status", status);

  function pageHref(targetPage: number) {
    const params = new URLSearchParams(baseParams);
    params.set("page", String(targetPage));
    return `/my-reports?${params.toString()}`;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">My reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything you've reported, active or resolved.
          </p>
        </div>
        <Link href="/reports/new" className={cn(buttonVariants({ size: "sm" }))}>
          New report
        </Link>
      </div>

      <form className="flex flex-wrap gap-3" method="GET">
        <Select name="type" defaultValue={type ?? ""} className="w-36">
          <option value="">All types</option>
          <option value={ReportType.LOST}>Lost</option>
          <option value={ReportType.FOUND}>Found</option>
        </Select>
        <Select name="status" defaultValue={status ?? ""} className="w-40">
          <option value="">All statuses</option>
          <option value={ReportStatus.ACTIVE}>Active</option>
          <option value={ReportStatus.RESOLVED}>Resolved</option>
        </Select>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        {total} {total === 1 ? "report" : "reports"}
      </p>

      <ul className="flex flex-col gap-3">
        {items.map((report) => (
          <ReportListItem key={report.id} report={report} />
        ))}
        {items.length === 0 && (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No reports match your filters.
          </p>
        )}
      </ul>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          {currentPage > 1 ? (
            <Link href={pageHref(currentPage - 1)} className="font-medium text-primary hover:underline">
              Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages ? (
            <Link href={pageHref(currentPage + 1)} className="font-medium text-primary hover:underline">
              Next
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
