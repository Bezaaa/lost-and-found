import { ItemCategory, Prisma, ReportStatus, ReportType, type Report, type User } from "@prisma/client";

import { prisma } from "@/lib/db";
import { getActiveMatchesForReport, recomputeMatchesForReport } from "../service";
import { MATCH_THRESHOLD } from "../weights";

// These tests exercise the real Prisma/Neon connection: the whole point of
// this milestone is the DB orchestration around the pure matching module, so
// there's nothing meaningful to assert without a real database round-trip.
// Everything created here is tracked and removed in afterAll.
//
// Neon's serverless compute can be cold (auto-suspended between test runs),
// so round trips here are slower than the 5s Jest default allows.
jest.setTimeout(30000);

const RUN_TAG = `svc-${Date.now()}`;
const createdUserIds: string[] = [];

async function createUser(label: string): Promise<User> {
  const user = await prisma.user.create({
    data: {
      email: `${RUN_TAG}-${label}@example.com`,
      name: `Test ${label}`,
      passwordHash: "not-a-real-hash",
    },
  });
  createdUserIds.push(user.id);
  return user;
}

async function createReport(
  reporterId: string,
  overrides: Partial<Prisma.ReportUncheckedCreateInput>
): Promise<Report> {
  return prisma.report.create({
    data: {
      reporterId,
      type: ReportType.LOST,
      status: ReportStatus.ACTIVE,
      category: ItemCategory.ELECTRONICS,
      itemName: "Test item",
      description: "A sufficiently long description for matching purposes.",
      location: "Test Location",
      date: new Date("2026-08-15"),
      contactInfo: "test@example.com",
      ...overrides,
    },
  });
}

afterAll(async () => {
  // Cascades: User -> Report -> PotentialMatch, per the schema's onDelete rules.
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  await prisma.$disconnect();
});

describe("recomputeMatchesForReport", () => {
  it("creating a LOST report matches an existing ACTIVE FOUND report", async () => {
    const user = await createUser("lost-vs-found");

    const found = await createReport(user.id, {
      type: ReportType.FOUND,
      itemName: "Blue Jansport backpack",
      description: "Blue backpack, front pocket has a small rip.",
      location: "Science Building",
      category: ItemCategory.BAGS_AND_BACKPACKS,
      date: new Date("2026-08-16"),
    });

    const lost = await createReport(user.id, {
      type: ReportType.LOST,
      itemName: "Blue Jansport backpack",
      description: "Navy blue backpack with a small tear on the front pocket.",
      location: "Science Building",
      category: ItemCategory.BAGS_AND_BACKPACKS,
      date: new Date("2026-08-15"),
    });

    await recomputeMatchesForReport(lost.id);

    const match = await prisma.potentialMatch.findUnique({
      where: { lostReportId_foundReportId: { lostReportId: lost.id, foundReportId: found.id } },
    });

    expect(match).not.toBeNull();
    expect(match!.score).toBeGreaterThanOrEqual(MATCH_THRESHOLD);
    expect(Array.isArray(match!.reasons)).toBe(true);
  });

  it("creating a FOUND report matches an existing ACTIVE LOST report", async () => {
    const user = await createUser("found-vs-lost");

    const lost = await createReport(user.id, {
      type: ReportType.LOST,
      itemName: "Student ID card",
      description: "Blue student ID card, lost near the library front desk.",
      location: "Library",
      category: ItemCategory.DOCUMENTS_AND_IDS,
      date: new Date("2026-08-05"),
    });

    const found = await createReport(user.id, {
      type: ReportType.FOUND,
      itemName: "Student ID",
      description: "Found a blue student ID card near the library front desk.",
      location: "Library",
      category: ItemCategory.DOCUMENTS_AND_IDS,
      date: new Date("2026-08-06"),
    });

    await recomputeMatchesForReport(found.id);

    const match = await prisma.potentialMatch.findUnique({
      where: { lostReportId_foundReportId: { lostReportId: lost.id, foundReportId: found.id } },
    });

    expect(match).not.toBeNull();
    expect(match!.score).toBeGreaterThanOrEqual(MATCH_THRESHOLD);
  });

  it("editing a report recomputes its existing match's score and reasons", async () => {
    const user = await createUser("edit-recompute");

    const found = await createReport(user.id, {
      type: ReportType.FOUND,
      itemName: "Red umbrella",
      description: "Red umbrella found near the main gate.",
      location: "Main Gate",
      category: ItemCategory.OTHER,
      date: new Date("2026-08-10"),
    });

    const lost = await createReport(user.id, {
      type: ReportType.LOST,
      itemName: "Red umbrella",
      description: "Red umbrella lost near the main gate.",
      location: "Main Gate",
      category: ItemCategory.OTHER,
      date: new Date("2026-08-09"),
    });

    await recomputeMatchesForReport(lost.id);

    const before = await prisma.potentialMatch.findUniqueOrThrow({
      where: { lostReportId_foundReportId: { lostReportId: lost.id, foundReportId: found.id } },
    });

    const updatedLost = await prisma.report.update({
      where: { id: lost.id },
      data: {
        itemName: "Broken bicycle lock",
        description: "A rusted bicycle lock with no key, completely unrelated to an umbrella.",
        location: "Far Parking Lot",
        category: ItemCategory.KEYS,
      },
    });

    await recomputeMatchesForReport(updatedLost.id);

    const afterMatch = await prisma.potentialMatch.findUnique({
      where: { lostReportId_foundReportId: { lostReportId: lost.id, foundReportId: found.id } },
    });

    // The pair no longer qualifies once the report was edited into something unrelated.
    expect(afterMatch).toBeNull();
    expect(before.score).toBeGreaterThanOrEqual(MATCH_THRESHOLD);
  });

  it("does not surface a below-threshold pair", async () => {
    const user = await createUser("below-threshold");

    const found = await createReport(user.id, {
      type: ReportType.FOUND,
      itemName: "iPhone charging cable",
      description: "White Apple charging cable, lightly used.",
      location: "Cafeteria",
      category: ItemCategory.ELECTRONICS,
      date: new Date("2026-08-18"),
    });

    const lost = await createReport(user.id, {
      type: ReportType.LOST,
      itemName: "House keys with red keychain",
      description: "Set of three keys on a red carabiner keychain.",
      location: "Parking Lot B",
      category: ItemCategory.KEYS,
      date: new Date("2026-08-01"),
    });

    await recomputeMatchesForReport(lost.id);

    const match = await prisma.potentialMatch.findUnique({
      where: { lostReportId_foundReportId: { lostReportId: lost.id, foundReportId: found.id } },
    });

    expect(match).toBeNull();
  });

  it("excludes a resolved report's matches from active matching without deleting the row", async () => {
    const user = await createUser("resolved-exclusion");

    const found = await createReport(user.id, {
      type: ReportType.FOUND,
      itemName: "Black leather wallet",
      description: "Black leather wallet found in the cafeteria.",
      location: "Cafeteria",
      category: ItemCategory.WALLETS_AND_CARDS,
      date: new Date("2026-08-12"),
    });

    const lost = await createReport(user.id, {
      type: ReportType.LOST,
      itemName: "Black leather wallet",
      description: "Black leather wallet lost in the cafeteria.",
      location: "Cafeteria",
      category: ItemCategory.WALLETS_AND_CARDS,
      date: new Date("2026-08-11"),
    });

    await recomputeMatchesForReport(lost.id);

    const activeBefore = await getActiveMatchesForReport(found.id);
    expect(activeBefore.some((m) => m.lostReportId === lost.id)).toBe(true);

    await prisma.report.update({
      where: { id: lost.id },
      data: { status: ReportStatus.RESOLVED, resolvedAt: new Date() },
    });

    const activeAfter = await getActiveMatchesForReport(found.id);
    expect(activeAfter.some((m) => m.lostReportId === lost.id)).toBe(false);

    const rawRow = await prisma.potentialMatch.findUnique({
      where: { lostReportId_foundReportId: { lostReportId: lost.id, foundReportId: found.id } },
    });
    expect(rawRow).not.toBeNull();
  });

  it("does not create duplicate rows for the same pair across repeated recomputes", async () => {
    const user = await createUser("no-duplicates");

    const found = await createReport(user.id, {
      type: ReportType.FOUND,
      itemName: "Silver watch",
      description: "Silver wristwatch found near the gym lockers.",
      location: "Gym",
      category: ItemCategory.JEWELRY_AND_WATCHES,
      date: new Date("2026-08-14"),
    });

    const lost = await createReport(user.id, {
      type: ReportType.LOST,
      itemName: "Silver watch",
      description: "Silver wristwatch lost near the gym lockers.",
      location: "Gym",
      category: ItemCategory.JEWELRY_AND_WATCHES,
      date: new Date("2026-08-13"),
    });

    await recomputeMatchesForReport(lost.id);
    await recomputeMatchesForReport(lost.id);
    await recomputeMatchesForReport(found.id);

    const rows = await prisma.potentialMatch.findMany({
      where: { lostReportId: lost.id, foundReportId: found.id },
    });

    expect(rows).toHaveLength(1);
  });
});
