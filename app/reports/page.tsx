import Link from "next/link";
import { ReportType } from "@prisma/client";

import { getActiveReports } from "@/lib/reports/queries";
import { requireUser } from "@/lib/session";
import { ReportListItem } from "@/components/reports/report-list-item";

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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Active reports</h1>
        <Link href="/reports/new" className="text-sm font-medium underline">
          + New report
        </Link>
      </div>

      <form className="flex flex-wrap gap-3" method="GET">
        <select name="type" defaultValue={type ?? ""} className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
          <option value="">All</option>
          <option value={ReportType.LOST}>Lost</option>
          <option value={ReportType.FOUND}>Found</option>
        </select>
        <input
          type="text"
          name="q"
          defaultValue={query ?? ""}
          placeholder="Search item, description, location..."
          className="min-w-64 flex-1 rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          Search
        </button>
      </form>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {total} active {total === 1 ? "report" : "reports"}
      </p>

      <ul className="flex flex-col gap-3">
        {items.map((report) => (
          <ReportListItem key={report.id} report={report} />
        ))}
        {items.length === 0 && (
          <p className="text-sm text-zinc-500">No reports match your filters.</p>
        )}
      </ul>

      <div className="flex items-center justify-between text-sm">
        {currentPage > 1 ? (
          <Link href={pageHref(currentPage - 1)} className="underline">
            Previous
          </Link>
        ) : (
          <span />
        )}
        <span className="text-zinc-500">
          Page {currentPage} of {totalPages}
        </span>
        {currentPage < totalPages ? (
          <Link href={pageHref(currentPage + 1)} className="underline">
            Next
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
