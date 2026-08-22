import { notFound, redirect } from "next/navigation";

import { getReportById } from "@/lib/reports/queries";
import { requireUser } from "@/lib/session";
import { updateReportAction } from "@/lib/actions/report-actions";
import { ReportForm } from "@/components/reports/report-form";

export default async function EditReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const report = await getReportById(id);
  if (!report) notFound();

  if (report.reporterId !== user.id || report.status !== "ACTIVE") {
    redirect(`/reports/${id}`);
  }

  const boundUpdate = updateReportAction.bind(null, report.id);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-12">
      <h1 className="text-2xl font-semibold">Edit report</h1>
      <ReportForm
        action={boundUpdate}
        fixedType={report.type}
        submitLabel="Save changes"
        defaults={{
          category: report.category,
          itemName: report.itemName,
          description: report.description,
          date: report.date.toISOString().slice(0, 10),
          timeOfDay: report.timeOfDay,
          location: report.location,
          locationDetail: report.locationDetail,
          color: report.color,
          brand: report.brand,
          imageUrl: report.imageUrl,
          contactInfo: report.contactInfo,
        }}
      />
    </div>
  );
}
