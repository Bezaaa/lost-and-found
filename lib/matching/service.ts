import "server-only";

import { Prisma, Report, ReportStatus, ReportType } from "@prisma/client";

import { prisma } from "@/lib/db";
import { computeMatchScore } from "@/lib/matching/score";
import { MATCH_THRESHOLD } from "@/lib/matching/weights";
import type { MatchableReport } from "@/lib/matching/types";

function toMatchable(report: Report): MatchableReport {
  return {
    category: report.category,
    itemName: report.itemName,
    description: report.description,
    location: report.location,
    locationDetail: report.locationDetail,
    date: report.date,
    timeOfDay: report.timeOfDay,
    color: report.color,
    brand: report.brand,
  };
}

/**
 * Recomputes every potential match involving one report against all currently
 * ACTIVE opposite-type reports, upserting qualifying pairs (score >=
 * MATCH_THRESHOLD) and removing any existing pair that no longer qualifies.
 *
 * No-ops for reports that don't exist or aren't ACTIVE (resolved reports
 * don't participate in matching). Call this after creating or editing an
 * ACTIVE report.
 */
export async function recomputeMatchesForReport(reportId: string): Promise<void> {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report || report.status !== ReportStatus.ACTIVE) return;

  const oppositeType = report.type === ReportType.LOST ? ReportType.FOUND : ReportType.LOST;

  const candidates = await prisma.report.findMany({
    where: { type: oppositeType, status: ReportStatus.ACTIVE },
  });

  const reportMatchable = toMatchable(report);

  for (const candidate of candidates) {
    const isLost = report.type === ReportType.LOST;
    const lostReportId = isLost ? report.id : candidate.id;
    const foundReportId = isLost ? candidate.id : report.id;
    const lost = isLost ? reportMatchable : toMatchable(candidate);
    const found = isLost ? toMatchable(candidate) : reportMatchable;

    const { score, reasons } = computeMatchScore(lost, found);
    const reasonsJson = reasons as unknown as Prisma.InputJsonValue;

    if (score >= MATCH_THRESHOLD) {
      await prisma.potentialMatch.upsert({
        where: { lostReportId_foundReportId: { lostReportId, foundReportId } },
        create: { lostReportId, foundReportId, score, reasons: reasonsJson },
        update: { score, reasons: reasonsJson },
      });
    } else {
      // No longer qualifies (or never did): make sure no stale row lingers.
      await prisma.potentialMatch.deleteMany({
        where: { lostReportId, foundReportId },
      });
    }
  }
}

/**
 * Potential matches for a report, filtered to pairs where BOTH linked reports
 * are still ACTIVE. Rows for resolved reports are left in the database (per
 * the schema's design) but excluded here, so resolving a report immediately
 * stops it from participating in active matching without any extra write.
 */
export async function getActiveMatchesForReport(reportId: string) {
  return prisma.potentialMatch.findMany({
    where: {
      OR: [{ lostReportId: reportId }, { foundReportId: reportId }],
      lostReport: { status: ReportStatus.ACTIVE },
      foundReport: { status: ReportStatus.ACTIVE },
    },
    orderBy: { score: "desc" },
    include: { lostReport: true, foundReport: true },
  });
}
