import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Report } from "@prisma/client";

import { CATEGORY_LABELS } from "@/lib/reports/labels";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ReportTypeBadge } from "@/components/reports/report-type-badge";

export function ReportListItem({ report }: { report: Report }) {
  return (
    <li>
      <Link href={`/reports/${report.id}`}>
        <Card className="p-4 transition-colors hover:border-primary/40 hover:bg-accent/30">
          <div className="flex items-center gap-2">
            <ReportTypeBadge type={report.type} />
            {report.status === "RESOLVED" && <Badge variant="resolved">Resolved</Badge>}
            <span className="font-medium text-foreground">{report.itemName}</span>
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            {CATEGORY_LABELS[report.category]}
            <span aria-hidden className="text-border">
              &middot;
            </span>
            <MapPin className="size-3.5" />
            {report.location}
          </p>
        </Card>
      </Link>
    </li>
  );
}
