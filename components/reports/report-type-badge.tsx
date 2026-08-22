import { ReportType } from "@prisma/client";

import { Badge } from "@/components/ui/badge";

export function ReportTypeBadge({ type }: { type: ReportType }) {
  return <Badge variant={type === ReportType.LOST ? "lost" : "found"}>{type}</Badge>;
}
