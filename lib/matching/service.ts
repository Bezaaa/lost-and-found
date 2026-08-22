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


export async function recomputeMatchesForReport(reportId: string): Promise<void> {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report || report.status !== ReportStatus.ACTIVE) return;

  const oppositeType = report.type === ReportType.LOST ? ReportType.FOUND : ReportType.LOST;

  if (report.type === ReportType.LOST) {
    await prisma.potentialMatch.deleteMany({ where: { foundReportId: report.id } });
  } else {
    await prisma.potentialMatch.deleteMany({ where: { lostReportId: report.id } });
  }

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
      
      await prisma.potentialMatch.deleteMany({
        where: { lostReportId, foundReportId },
      });
    }
  }
}


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


export async function getActiveMatchesForUser(userId: string) {
  return prisma.potentialMatch.findMany({
    where: {
      lostReport: { status: ReportStatus.ACTIVE },
      foundReport: { status: ReportStatus.ACTIVE },
      OR: [{ lostReport: { reporterId: userId } }, { foundReport: { reporterId: userId } }],
    },
    orderBy: { score: "desc" },
    include: {
      lostReport: { include: { reporter: { select: { id: true, name: true } } } },
      foundReport: { include: { reporter: { select: { id: true, name: true } } } },
    },
  });
}


export async function getMatchById(matchId: string) {
  return prisma.potentialMatch.findUnique({
    where: { id: matchId },
    include: {
      lostReport: { include: { reporter: { select: { id: true, name: true } } } },
      foundReport: { include: { reporter: { select: { id: true, name: true } } } },
    },
  });
}
