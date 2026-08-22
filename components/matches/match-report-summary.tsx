import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import type { Report } from "@prisma/client";

import { CATEGORY_LABELS } from "@/lib/reports/labels";
import { ReportTypeBadge } from "@/components/reports/report-type-badge";

export type ReportWithReporter = Report & { reporter: { name: string | null } };

export function MatchReportSummary({
  report,
  showDescription = false,
}: {
  report: ReportWithReporter;
  showDescription?: boolean;
}) {
  return (
    <Link
      href={`/reports/${report.id}`}
      className="flex flex-1 flex-col gap-1.5 rounded-md border border-border p-4 transition-colors hover:border-primary/40 hover:bg-accent/30"
    >
      <div className="flex items-center gap-2">
        <ReportTypeBadge type={report.type} />
        <span className="font-medium text-foreground">{report.itemName}</span>
      </div>
      <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[report.category]}</p>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="size-3.5" />
        {report.location}
        {report.locationDetail ? ` — ${report.locationDetail}` : ""}
      </p>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CalendarDays className="size-3.5" />
        {report.date.toISOString().slice(0, 10)}
      </p>
      {showDescription && (
        <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-xs text-muted-foreground">
          {report.description}
        </p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">Reported by {report.reporter.name}</p>
    </Link>
  );
}
