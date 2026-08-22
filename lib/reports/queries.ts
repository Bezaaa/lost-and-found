import "server-only";

import { Prisma, ReportStatus, ReportType } from "@prisma/client";

import { prisma } from "@/lib/db";

const PAGE_SIZE = 10;

function searchClause(query: string | undefined): Prisma.ReportWhereInput | undefined {
  const q = query?.trim();
  if (!q) return undefined;

  return {
    OR: [
      { itemName: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
    ],
  };
}

function normalizePage(page: number | undefined) {
  return Number.isFinite(page) && (page as number) > 0 ? Math.floor(page as number) : 1;
}

async function paginate(where: Prisma.ReportWhereInput, page: number | undefined) {
  const currentPage = normalizePage(page);

  const [items, total] = await Promise.all([
    prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { reporter: { select: { id: true, name: true } } },
    }),
    prisma.report.count({ where }),
  ]);

  return {
    items,
    total,
    page: currentPage,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export type BrowseReportsFilters = {
  type?: ReportType;
  query?: string;
  page?: number;
};

/** Global browse surface: only ACTIVE reports across all users. */
export async function getActiveReports(filters: BrowseReportsFilters = {}) {
  const where: Prisma.ReportWhereInput = {
    status: ReportStatus.ACTIVE,
    ...(filters.type ? { type: filters.type } : {}),
    ...searchClause(filters.query),
  };

  return paginate(where, filters.page);
}

export type MyReportsFilters = {
  type?: ReportType;
  status?: ReportStatus;
  query?: string;
  page?: number;
};

/** Scoped to a single reporter, with All/Lost/Found/Active/Resolved filters. */
export async function getUserReports(reporterId: string, filters: MyReportsFilters = {}) {
  const where: Prisma.ReportWhereInput = {
    reporterId,
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...searchClause(filters.query),
  };

  return paginate(where, filters.page);
}

export async function getReportById(id: string) {
  return prisma.report.findUnique({
    where: { id },
    include: { reporter: { select: { id: true, name: true, email: true } } },
  });
}
