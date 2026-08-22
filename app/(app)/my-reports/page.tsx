import Link from "next/link";
import { ReportStatus, ReportType } from "@prisma/client";

import { getUserReports } from "@/lib/reports/queries";
import { requireUser } from "@/lib/session";
import { ReportListItem } from "@/components/reports/report-list-item";

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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My reports</h1>
        <Link href="/reports/new" className="text-sm font-medium underline">
          + New report
        </Link>
      </div>

      <form className="flex flex-wrap gap-3" method="GET">
        <select name="type" defaultValue={type ?? ""} className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
          <option value="">All types</option>
          <option value={ReportType.LOST}>Lost</option>
          <option value={ReportType.FOUND}>Found</option>
        </select>
        <select name="status" defaultValue={status ?? ""} className="rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
          <option value="">All statuses</option>
          <option value={ReportStatus.ACTIVE}>Active</option>
          <option value={ReportStatus.RESOLVED}>Resolved</option>
        </select>
        <button
          type="submit"
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          Filter
        </button>
      </form>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {total} {total === 1 ? "report" : "reports"}
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
