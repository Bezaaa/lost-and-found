import { notFound, redirect } from "next/navigation";

import { getReportById } from "@/lib/reports/queries";
import { requireUser } from "@/lib/session";
import { updateReportAction } from "@/lib/actions/report-actions";
import { ReportForm } from "@/components/reports/report-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Edit report</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Report details</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportForm
            action={boundUpdate}
            submitLabel="Save changes"
            defaults={{
              type: report.type,
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
        </CardContent>
      </Card>
    </div>
  );
}
