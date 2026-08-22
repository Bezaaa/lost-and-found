import Link from "next/link";
import { Search } from "lucide-react";
import { ReportType } from "@prisma/client";

import { getActiveReports } from "@/lib/reports/queries";
import { requireUser } from "@/lib/session";
import { ReportListItem } from "@/components/reports/report-list-item";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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

  const baseParams = new URLSearchParams();
  if (type) baseParams.set("type", type);
  if (query) baseParams.set("q", query);

  function pageHref(targetPage: number) {
    const params = new URLSearchParams(baseParams);
    params.set("page", String(targetPage));
    return `/reports?${params.toString()}`;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Active reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse everything currently reported lost or found on campus.
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
        <div className="relative min-w-64 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            name="q"
            defaultValue={query ?? ""}
            placeholder="Search item, description, location..."
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        {total} active {total === 1 ? "report" : "reports"}
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
