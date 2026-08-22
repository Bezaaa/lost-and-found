import { createReportAction } from "@/lib/actions/report-actions";
import { requireUser } from "@/lib/session";
import { ReportForm } from "@/components/reports/report-form";

export default async function NewReportPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-12">
      <h1 className="text-2xl font-semibold">Create a report</h1>
      <ReportForm
        action={createReportAction}
        defaults={{ contactInfo: user.email ?? "" }}
        submitLabel="Create report"
      />
    </div>
  );
}
