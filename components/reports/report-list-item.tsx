import Link from "next/link";
import type { Report } from "@prisma/client";

import { CATEGORY_LABELS } from "@/lib/reports/labels";

export function ReportListItem({ report }: { report: Report }) {
  return (
    <li className="rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <Link href={`/reports/${report.id}`} className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span
            className={`rounded px-2 py-0.5 text-xs font-medium ${
              report.type === "LOST"
                ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                : "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
            }`}
          >
            {report.type}
          </span>
          {report.status === "RESOLVED" && (
            <span className="rounded bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              RESOLVED
            </span>
          )}
          <span className="font-medium">{report.itemName}</span>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {CATEGORY_LABELS[report.category]} &middot; {report.location}
        </p>
      </Link>
    </li>
  );
}
