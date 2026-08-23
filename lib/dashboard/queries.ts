import "server-only";

import { ReportStatus, ReportType } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getActiveMatchesForUser } from "@/lib/matching/service";

const RECENT_REPORTS_LIMIT = 5;
const STRONGEST_MATCHES_LIMIT = 2;

/**
 * Aggregates data already available elsewhere (report counts, recent active
 * reports, the user's own matches) for the dashboard's lightweight summary.
 * No new backend behavior - purely read-side composition.
 */
export async function getDashboardData(userId: string) {
  const [activeLostCount, activeFoundCount, recentReports, myMatches] = await Promise.all([
    prisma.report.count({ where: { status: ReportStatus.ACTIVE, type: ReportType.LOST } }),
    prisma.report.count({ where: { status: ReportStatus.ACTIVE, type: ReportType.FOUND } }),
    prisma.report.findMany({
      where: { status: ReportStatus.ACTIVE },
      orderBy: { createdAt: "desc" },
      take: RECENT_REPORTS_LIMIT,
      include: { reporter: { select: { name: true } } },
    }),
    getActiveMatchesForUser(userId),
  ]);

  return {
    activeLostCount,
    activeFoundCount,
    potentialMatchesCount: myMatches.total,
    recentReports,
    strongestMatches: myMatches.items.slice(0, STRONGEST_MATCHES_LIMIT),
  };
}
