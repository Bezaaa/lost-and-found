import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import type { Report } from "@prisma/client";

import { CATEGORY_LABELS } from "@/lib/reports/labels";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ReportTypeBadge } from "@/components/reports/report-type-badge";
import { ReportImageThumb } from "@/components/reports/report-image-thumb";
import { cn } from "@/lib/utils";

export function ReportListItem({ report }: { report: Report }) {
  return (
    <li>
      <Link
        href={`/reports/${report.id}`}
        className="group block cursor-pointer focus-visible:outline-none"
      >
        <Card className="flex gap-4 p-4 transition-all group-hover:border-primary/40 group-hover:shadow-md group-focus-visible:border-primary/40 group-focus-visible:ring-2 group-focus-visible:ring-ring">
          <ReportImageThumb
            imageUrl={report.imageUrl}
            itemName={report.itemName}
            category={report.category}
          />

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <ReportTypeBadge type={report.type} />
              {report.status === "RESOLVED" && <Badge variant="resolved">Resolved</Badge>}
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

            <p className="line-clamp-2 text-sm text-muted-foreground">{report.description}</p>
          </div>

          <div className="hidden shrink-0 items-center sm:flex">
            <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), "pointer-events-none")}>
              View details
            </span>
          </div>
        </Card>
      </Link>
    </li>
  );
}
