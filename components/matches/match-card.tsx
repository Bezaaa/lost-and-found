import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";

import type { SignalReason } from "@/lib/matching/types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MatchScoreRing } from "@/components/matches/match-score-ring";
import { getMatchTier } from "@/components/matches/match-tier";
import { MatchKeyReasons } from "@/components/matches/match-key-reasons";
import { MatchReportSummary, type ReportWithReporter } from "@/components/matches/match-report-summary";
import { cn } from "@/lib/utils";

export function MatchCard({
  id,
  score,
  reasons,
  lostReport,
  foundReport,
}: {
  id: string;
  score: number;
  reasons: SignalReason[];
  lostReport: ReportWithReporter;
  foundReport: ReportWithReporter;
}) {
  const tier = getMatchTier(score);

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-4 space-y-0">
        <MatchScoreRing score={score} />
        <div>
          <Badge variant={tier.badgeVariant}>{tier.label}</Badge>
          <p className="mt-1 text-sm text-muted-foreground">
            Potential match — {score}/100 similarity
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <MatchReportSummary report={lostReport} />
          <ArrowLeftRight className="mx-auto size-4 shrink-0 text-muted-foreground sm:mx-0" />
          <MatchReportSummary report={foundReport} />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Key reasons</p>
          <MatchKeyReasons reasons={reasons} />
        </div>

        <Link href={`/matches/${id}`} className={cn(buttonVariants({ variant: "outline" }), "self-start")}>
          View details
        </Link>
      </CardContent>
    </Card>
  );
}
