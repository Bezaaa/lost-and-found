import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";

import { getMatchById } from "@/lib/matching/service";
import { requireUser } from "@/lib/session";
import { TIME_OF_DAY_LABELS } from "@/lib/reports/labels";
import type { SignalReason } from "@/lib/matching/types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchScoreRing } from "@/components/matches/match-score-ring";
import { getMatchTier } from "@/components/matches/match-tier";
import { MatchReportSummary, type ReportWithReporter } from "@/components/matches/match-report-summary";
import { ReasonBar } from "@/components/matches/reason-bar";
import { cn } from "@/lib/utils";

function daysApart(a: Date, b: Date): number {
  return Math.round(Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

function ContactCard({ report }: { report: ReportWithReporter }) {
  const isEmail = report.contactInfo.includes("@");

  return (
    <Card className="bg-muted/40">
      <CardContent className="p-4">
        <p className="text-sm font-medium text-foreground">
          Contact the {report.type === "LOST" ? "person who lost this" : "person who found this"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEmail ? (
            <a href={`mailto:${report.contactInfo}`} className="text-primary hover:underline">
              {report.contactInfo}
            </a>
          ) : (
            report.contactInfo
          )}
        </p>
      </CardContent>
    </Card>
  );
}

export default async function MatchDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const match = await getMatchById(id);
  if (!match) notFound();

  const isParticipant =
    match.lostReport.reporterId === user.id || match.foundReport.reporterId === user.id;
  if (!isParticipant) {
    redirect("/matches");
  }

  const tier = getMatchTier(match.score);
  const reasons = match.reasons as unknown as SignalReason[];
  const gapDays = daysApart(match.lostReport.date, match.foundReport.date);


  const viewerOwnsLost = match.lostReport.reporterId === user.id;
  const viewerOwnsFound = match.foundReport.reporterId === user.id;
  const contactTarget = viewerOwnsLost && !viewerOwnsFound
    ? match.foundReport
    : viewerOwnsFound && !viewerOwnsLost
      ? match.lostReport
      : null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <Link href="/matches" className="text-sm font-medium text-primary hover:underline">
          ← Back to potential matches
        </Link>
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-4 space-y-0">
          <MatchScoreRing score={match.score} />
          <div>
            <Badge variant={tier.badgeVariant}>{tier.label}</Badge>
            <p className="mt-1 text-sm text-muted-foreground">
              Potential match — {match.score}/100 similarity
            </p>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <MatchReportSummary report={match.lostReport} showDescription />
            <MatchReportSummary report={match.foundReport} showDescription />
          </div>

          <div className="flex items-center gap-2 rounded-md border border-border p-3 text-sm">
            <CalendarDays className="size-4 text-muted-foreground" />
            <span className="text-foreground">
              {gapDays === 0 ? "Reported on the same day" : `${gapDays} day(s) apart`}
            </span>
            <span className="text-muted-foreground">
              ({match.lostReport.date.toISOString().slice(0, 10)}
              {match.lostReport.timeOfDay ? ` · ${TIME_OF_DAY_LABELS[match.lostReport.timeOfDay]}` : ""}
              {" → "}
              {match.foundReport.date.toISOString().slice(0, 10)}
              {match.foundReport.timeOfDay ? ` · ${TIME_OF_DAY_LABELS[match.foundReport.timeOfDay]}` : ""}
              )
            </span>
          </div>

          <div className="flex gap-3">
            <Link href={`/reports/${match.lostReportId}`} className={cn(buttonVariants({ variant: "outline" }), "flex-1")}>
              View lost report
            </Link>
            <Link href={`/reports/${match.foundReportId}`} className={cn(buttonVariants({ variant: "outline" }), "flex-1")}>
              View found report
            </Link>
          </div>

          {contactTarget && <ContactCard report={contactTarget} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Why this score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {reasons.map((reason) => (
              <ReasonBar key={reason.signal} reason={reason} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
