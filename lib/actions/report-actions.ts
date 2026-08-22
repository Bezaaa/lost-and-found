"use server";

import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ReportStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import {
  createReportSchema,
  parseReportFormData,
  updateReportSchema,
} from "@/lib/validations/report";

export type ReportFormState = { error?: string } | undefined;

export async function createReportAction(
  _prevState: ReportFormState,
  formData: FormData
): Promise<ReportFormState> {
  const user = await requireUser();

  const parsed = createReportSchema.safeParse(parseReportFormData(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const report = await prisma.report.create({
    data: {
      ...parsed.data,
      reporterId: user.id,
    },
  });

  // TODO(matching milestone): recompute potential matches for this report
  // against active opposite-type reports once the matching module exists.

  revalidatePath("/reports");
  revalidatePath("/my-reports");
  redirect(`/reports/${report.id}`);
}

export async function updateReportAction(
  reportId: string,
  _prevState: ReportFormState,
  formData: FormData
): Promise<ReportFormState> {
  const user = await requireUser();

  const existing = await prisma.report.findUnique({ where: { id: reportId } });
  if (!existing) notFound();

  if (existing.reporterId !== user.id) {
    return { error: "You do not have permission to edit this report." };
  }
  if (existing.status !== ReportStatus.ACTIVE) {
    return { error: "Resolved reports can no longer be edited." };
  }

  const parsed = updateReportSchema.safeParse(parseReportFormData(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await prisma.report.update({
    where: { id: reportId },
    data: parsed.data,
  });

  // TODO(matching milestone): recompute potential matches for this report,
  // since its details (and therefore its match scores) may have changed.

  revalidatePath(`/reports/${reportId}`);
  revalidatePath("/reports");
  revalidatePath("/my-reports");
  redirect(`/reports/${reportId}`);
}

export async function resolveReportAction(reportId: string): Promise<void> {
  const user = await requireUser();

  const existing = await prisma.report.findUnique({ where: { id: reportId } });
  if (!existing) notFound();

  if (existing.reporterId !== user.id) {
    throw new Error("You do not have permission to resolve this report.");
  }

  if (existing.status !== ReportStatus.RESOLVED) {
    await prisma.report.update({
      where: { id: reportId },
      data: { status: ReportStatus.RESOLVED, resolvedAt: new Date() },
    });

    revalidatePath(`/reports/${reportId}`);
    revalidatePath("/reports");
    revalidatePath("/my-reports");
  }

  redirect(`/reports/${reportId}`);
}
